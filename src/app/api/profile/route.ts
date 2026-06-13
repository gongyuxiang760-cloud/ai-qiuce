import { NextResponse } from "next/server";
import { createClient, requireAuthUser } from "@/lib/supabase/server";
import {
  getUserProfile,
  getUserStats,
  getFinancialProfile,
  getBets,
} from "@/lib/supabase/data";
import { computeAssetStats } from "@/lib/stats";
import { getDisplayUsername } from "@/lib/auth/username";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const [userProfile, stats, financialProfile, bets] = await Promise.all([
      getUserProfile(supabase, user.id),
      getUserStats(supabase, user.id),
      getFinancialProfile(supabase, user.id),
      getBets(supabase, user.id),
    ]);

    const principal = financialProfile?.principal || 1000;
    const assetStats = computeAssetStats(principal, bets);

    return NextResponse.json({
      user: userProfile || {
        id: user.id,
        email: user.email,
        username: getDisplayUsername(user.user_metadata),
        nickname:
          getDisplayUsername(user.user_metadata) ||
          user.user_metadata?.full_name ||
          "用户",
        avatar: user.user_metadata?.avatar_url,
        membership: "free",
        created_at: user.created_at,
        last_login: null,
        status: "active",
      },
      stats: {
        totalBets: stats.totalBets,
        totalProfit: assetStats.totalProfit,
        roi: assetStats.roi,
      },
    });
  } catch (error) {
    return handleApiError(error, "获取用户信息失败");
  }
}
