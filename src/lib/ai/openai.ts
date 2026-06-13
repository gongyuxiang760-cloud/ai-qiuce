import OpenAI from "openai";
import type { Bet, Profile } from "@/types";
import { formatCurrency } from "@/lib/utils";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY 环境变量");
  }
  return new OpenAI({ apiKey });
}

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `你是「AI球策」，一位专业的足球投注策略顾问。
你的职责是帮助用户进行理性、科学的足球投注决策。

重要原则：
1. 强调风险控制，单次投注不超过总资金的 5%
2. 建议基于数据分析，而非盲目跟风
3. 提醒用户投注有风险，量力而行
4. 用中文回答，语气专业但亲切
5. 给出具体、可操作的建议`;

export async function generateChatResponse(
  message: string,
  context: { profile: Profile | null; recentBets: Bet[] }
): Promise<string> {
  const contextInfo = buildContextInfo(context);

  const response = await getOpenAI().chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${contextInfo}\n\n用户问题：${message}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return (
    response.choices[0]?.message?.content ||
    "抱歉，暂时无法生成回复，请稍后再试。"
  );
}

export async function generateReview(bets: Bet[], profile: Profile | null): Promise<string> {
  const betsSummary = bets
    .map(
      (b) =>
        `${b.bet_date} | ${b.match_name} | ${b.bet_type} ${b.selection} | 赔率${b.odds} | 投注${b.stake}元 | ${resultLabel(b.result)} | 盈亏${b.profit}元`
    )
    .join("\n");

  const response = await getOpenAI().chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n请根据用户的投注记录生成一份详细的复盘报告，包含：
1. 整体表现总结（胜率、盈亏、ROI）
2. 投注习惯分析（偏好类型、常见错误）
3. 风险管理评估
4. 具体改进建议（3-5条）
5. 下期投注策略建议

请用 Markdown 格式输出，结构清晰。`,
      },
      {
        role: "user",
        content: `本金：${profile?.principal || 1000}元\n\n投注记录（共${bets.length}条）：\n${betsSummary || "暂无投注记录"}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 2000,
  });

  return (
    response.choices[0]?.message?.content ||
    "抱歉，暂时无法生成复盘报告，请稍后再试。"
  );
}

export async function generateDailyInsight(
  profile: Profile | null,
  todayBets: Bet[]
): Promise<{ todayFunds: number; suggestions: string; risks: string }> {
  const principal = profile?.principal || 1000;
  const todayStake = todayBets.reduce((sum, b) => sum + b.stake, 0);
  const todayFunds = principal - todayStake;

  const response = await getOpenAI().chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n请生成今日投注建议和风险提示，返回 JSON 格式：
{
  "suggestions": "今日建议（200字以内，包含具体赛事方向）",
  "risks": "今日风险（150字以内，包含需要规避的情况）"
}`,
      },
      {
        role: "user",
        content: `本金：${principal}元，今日可用资金约：${todayFunds}元，今日已投注${todayBets.length}笔，共${todayStake}元。`,
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(content);
    return {
      todayFunds,
      suggestions: parsed.suggestions || "今日建议关注主流联赛，控制单场投注比例。",
      risks: parsed.risks || "注意冷门赛事风险，避免追高赔率。",
    };
  } catch {
    return {
      todayFunds,
      suggestions: "今日建议关注主流联赛，单场投注不超过可用资金的 5%。",
      risks: "避免追逐高赔率冷门，注意球队伤病和赛程密集影响。",
    };
  }
}

function buildContextInfo(context: {
  profile: Profile | null;
  recentBets: Bet[];
}): string {
  const { profile, recentBets } = context;
  const lines = [
    `当前本金：${formatCurrency(profile?.principal || 1000)}`,
  ];

  if (recentBets.length > 0) {
    lines.push("最近投注记录：");
    recentBets.slice(0, 5).forEach((b) => {
      lines.push(
        `- ${b.bet_date} ${b.match_name} ${b.bet_type} ${b.selection} 赔率${b.odds} 投注${b.stake}元 ${resultLabel(b.result)}`
      );
    });
  }

  return lines.join("\n");
}

function resultLabel(result: string): string {
  const map: Record<string, string> = {
    pending: "待结算",
    win: "赢",
    lose: "输",
    push: "走水",
  };
  return map[result] || result;
}
