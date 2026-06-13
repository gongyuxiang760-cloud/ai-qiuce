import { NextRequest, NextResponse } from "next/server";
import {
  getBets,
  createBet,
  updateBet,
  deleteBet,
} from "@/lib/supabase/client";
import { calculateProfit } from "@/lib/utils";
import type { BetFormData } from "@/types";

export async function GET() {
  try {
    const bets = await getBets();
    return NextResponse.json(bets);
  } catch (error) {
    console.error("Get bets error:", error);
    return NextResponse.json({ error: "获取投注记录失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: BetFormData = await request.json();
    const profit = calculateProfit(data.stake, data.odds, data.result);

    const bet = await createBet({
      match_name: data.match_name,
      league: data.league || null,
      bet_type: data.bet_type,
      selection: data.selection,
      odds: data.odds,
      stake: data.stake,
      result: data.result,
      profit,
      bet_date: data.bet_date,
      notes: data.notes || null,
    });

    return NextResponse.json(bet);
  } catch (error) {
    console.error("Create bet error:", error);
    return NextResponse.json({ error: "添加投注失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data }: BetFormData & { id: string } = await request.json();
    const profit = calculateProfit(data.stake, data.odds, data.result);

    const bet = await updateBet(id, {
      match_name: data.match_name,
      league: data.league || null,
      bet_type: data.bet_type,
      selection: data.selection,
      odds: data.odds,
      stake: data.stake,
      result: data.result,
      profit,
      bet_date: data.bet_date,
      notes: data.notes || null,
    });

    return NextResponse.json(bet);
  } catch (error) {
    console.error("Update bet error:", error);
    return NextResponse.json({ error: "修改投注失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await deleteBet(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bet error:", error);
    return NextResponse.json({ error: "删除投注失败" }, { status: 500 });
  }
}
