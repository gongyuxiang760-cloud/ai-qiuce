import { NextRequest, NextResponse } from "next/server";
import { getProfile, upsertProfile } from "@/lib/supabase/client";
import { getBets } from "@/lib/supabase/client";
import { computeAssetStats, computeProfitCurve } from "@/lib/stats";

export async function GET() {
  try {
    const [profile, bets] = await Promise.all([getProfile(), getBets()]);
    const principal = profile?.principal || 1000;
    const stats = computeAssetStats(principal, bets);
    const profitCurve = computeProfitCurve(principal, bets);

    return NextResponse.json({ stats, profitCurve, principal });
  } catch (error) {
    console.error("Get assets error:", error);
    return NextResponse.json({ error: "获取资产数据失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { principal } = await request.json();

    if (!principal || principal <= 0) {
      return NextResponse.json({ error: "本金必须大于 0" }, { status: 400 });
    }

    const profile = await upsertProfile(principal);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Update principal error:", error);
    return NextResponse.json({ error: "更新本金失败" }, { status: 500 });
  }
}
