import type { Bet, AssetStats, ProfitPoint } from "@/types";
import { calculateProfit } from "@/lib/utils";

export function computeAssetStats(
  principal: number,
  bets: Bet[]
): AssetStats {
  const settledBets = bets.filter((b) => b.result !== "pending");
  const totalProfit = bets.reduce((sum, b) => {
    if (b.result === "pending") return sum;
    return sum + (b.profit ?? calculateProfit(b.stake, b.odds, b.result));
  }, 0);

  const totalStake = settledBets.reduce((sum, b) => sum + b.stake, 0);
  const wins = settledBets.filter((b) => b.result === "win").length;
  const winRate = settledBets.length > 0 ? (wins / settledBets.length) * 100 : 0;
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

  return {
    principal,
    totalProfit,
    roi,
    currentBalance: principal + totalProfit,
    winRate,
    totalBets: bets.length,
    settledBets: settledBets.length,
  };
}

export function computeProfitCurve(
  principal: number,
  bets: Bet[]
): ProfitPoint[] {
  const settled = bets
    .filter((b) => b.result !== "pending")
    .sort((a, b) => a.bet_date.localeCompare(b.bet_date));

  const points: ProfitPoint[] = [{ date: "起始", balance: principal, profit: 0 }];
  let runningBalance = principal;
  let runningProfit = 0;

  const byDate = new Map<string, number>();
  for (const bet of settled) {
    const profit =
      bet.profit ?? calculateProfit(bet.stake, bet.odds, bet.result);
    byDate.set(bet.bet_date, (byDate.get(bet.bet_date) || 0) + profit);
  }

  for (const [date, dayProfit] of [...byDate.entries()].sort()) {
    runningProfit += dayProfit;
    runningBalance = principal + runningProfit;
    points.push({ date, balance: runningBalance, profit: runningProfit });
  }

  return points;
}

export function computeTodayFunds(principal: number, todayBets: Bet[]): number {
  const todayStake = todayBets.reduce((sum, b) => sum + b.stake, 0);
  const todayProfit = todayBets
    .filter((b) => b.result !== "pending")
    .reduce(
      (sum, b) =>
        sum + (b.profit ?? calculateProfit(b.stake, b.odds, b.result)),
      0
    );
  return principal + todayProfit - todayStake;
}
