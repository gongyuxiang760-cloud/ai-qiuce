import { NextResponse } from "next/server";
import { createClient, requireAuthUser } from "@/lib/supabase/server";
import {
  getFinancialProfile,
  getBets,
  upsertFinancialProfile,
} from "@/lib/supabase/data";
import { computeAssetStats, computeProfitCurve } from "@/lib/stats";
import { handleApiError, unauthorized } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const [profile, bets] = await Promise.all([
      getFinancialProfile(supabase, user.id),
      getBets(supabase, user.id),
    ]);

    const principal = profile?.principal || 1000;
    const stats = computeAssetStats(principal, bets);
    const profitCurve = computeProfitCurve(principal, bets);

    return NextResponse.json({ stats, profitCurve, principal });
  } catch (error) {
    return handleApiError(error, "获取资产数据失败");
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuthUser();
    const { principal } = await request.json();

    if (!principal || principal <= 0) {
      return NextResponse.json({ error: "本金必须大于 0" }, { status: 400 });
    }

    const supabase = await createClient();
    const profile = await upsertFinancialProfile(supabase, user.id, principal);
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error, "更新本金失败");
  }
}
