import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import {
  getFinancialProfile,
  getTodayBets,
  getTodayInsight,
  upsertDailyInsight,
} from "@/lib/supabase/data";
import { generateDailyInsight } from "@/lib/ai/deepseek";
import { computeTodayFunds } from "@/lib/stats";
import { handleApiError } from "@/lib/api-utils";

const GUEST_INSIGHT = {
  todayFunds: 1000,
  suggestions: "登录后可获取个性化投注建议。建议关注主流联赛，单场投注不超过总资金的 5%。",
  risks: "登录后可获取个性化风险提示。注意冷门赛事风险，避免追高赔率。",
  guest: true,
};

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(GUEST_INSIGHT);
    }

    const supabase = await createClient();
    const [profile, todayBets, insight] = await Promise.all([
      getFinancialProfile(supabase, user.id),
      getTodayBets(supabase, user.id),
      getTodayInsight(supabase, user.id),
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

    await upsertDailyInsight(supabase, user.id, {
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
    return NextResponse.json({
      todayFunds: 1000,
      suggestions: "建议关注主流联赛，控制单场投注比例。",
      risks: "注意冷门赛事风险，避免追高赔率。",
      fallback: true,
    });
  }
}

export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const supabase = await createClient();
    const [profile, todayBets] = await Promise.all([
      getFinancialProfile(supabase, user.id),
      getTodayBets(supabase, user.id),
    ]);

    const generated = await generateDailyInsight(profile, todayBets);

    await upsertDailyInsight(supabase, user.id, {
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
    return handleApiError(error, "刷新今日建议失败");
  }
}
