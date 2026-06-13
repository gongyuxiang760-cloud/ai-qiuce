import { NextResponse } from "next/server";
import { createClient, requireAuthUser } from "@/lib/supabase/server";
import {
  getBets,
  getFinancialProfile,
  createReview,
  getReviews,
} from "@/lib/supabase/data";
import { generateReview } from "@/lib/ai/deepseek";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const reviews = await getReviews(supabase, user.id);
    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error, "获取复盘记录失败");
  }
}

export async function POST() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const [bets, profile] = await Promise.all([
      getBets(supabase, user.id),
      getFinancialProfile(supabase, user.id),
    ]);

    const content = await generateReview(bets, profile);
    const dates = bets.map((b) => b.bet_date).sort();

    const review = await createReview(supabase, user.id, {
      content,
      period_start: dates[0] || null,
      period_end: dates[dates.length - 1] || null,
    });

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error, "生成复盘失败，请检查 DeepSeek API 配置");
  }
}
