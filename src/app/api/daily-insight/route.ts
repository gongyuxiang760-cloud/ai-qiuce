import { NextResponse } from "next/server";
import {
  getProfile,
  getBets,
  getTodayBets,
  getTodayInsight,
  upsertDailyInsight,
} from "@/lib/supabase/client";
import { generateDailyInsight } from "@/lib/ai/deepseek";
import { computeTodayFunds } from "@/lib/stats";

export async function GET() {
  try {
    const [profile, todayBets, insight] = await Promise.all([
      getProfile(),
      getTodayBets(),
      getTodayInsight(),
    ]);

    const principal = profile?.principal || 1000;
    const todayFunds = computeTodayFunds(principal, todayBets);

    if (insight) {
      return NextResponse.json({
        todayFunds,
        suggestions: insight.suggestions,
        risks: insight.risks,
        cached: true,
      });
    }

    const generated = await generateDailyInsight(profile, todayBets);

    await upsertDailyInsight({
      insight_date: new Date().toISOString().split("T")[0],
      today_funds: generated.todayFunds,
      suggestions: generated.suggestions,
      risks: generated.risks,
    });

    return NextResponse.json({
      todayFunds: generated.todayFunds,
      suggestions: generated.suggestions,
      risks: generated.risks,
      cached: false,
    });
  } catch (error) {
    console.error("Daily insight error:", error);
    const profile = await getProfile().catch(() => null);
    const todayBets = await getTodayBets().catch(() => []);
    const principal = profile?.principal || 1000;
    const todayFunds = computeTodayFunds(principal, todayBets);

    return NextResponse.json({
      todayFunds,
      suggestions: "建议关注主流联赛，单场投注不超过可用资金的 5%。",
      risks: "避免追逐高赔率冷门，注意球队伤病和赛程密集影响。",
      fallback: true,
    });
  }
}

export async function POST() {
  try {
    const [profile, todayBets] = await Promise.all([
      getProfile(),
      getTodayBets(),
    ]);

    const generated = await generateDailyInsight(profile, todayBets);

    await upsertDailyInsight({
      insight_date: new Date().toISOString().split("T")[0],
      today_funds: generated.todayFunds,
      suggestions: generated.suggestions,
      risks: generated.risks,
    });

    return NextResponse.json({
      todayFunds: generated.todayFunds,
      suggestions: generated.suggestions,
      risks: generated.risks,
      refreshed: true,
    });
  } catch (error) {
    console.error("Refresh insight error:", error);
    return NextResponse.json(
      { error: "刷新今日建议失败" },
      { status: 500 }
    );
  }
}
