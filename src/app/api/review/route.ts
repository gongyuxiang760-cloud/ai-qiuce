import { NextResponse } from "next/server";
import { getBets, getProfile, createReview, getReviews } from "@/lib/supabase/client";
import { generateReview } from "@/lib/ai/openai";

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json([]);
  }
}

export async function POST() {
  try {
    const [bets, profile] = await Promise.all([getBets(), getProfile()]);

    const content = await generateReview(bets, profile);

    const dates = bets.map((b) => b.bet_date).sort();
    const review = await createReview({
      content,
      period_start: dates[0] || null,
      period_end: dates[dates.length - 1] || null,
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review generation error:", error);
    return NextResponse.json(
      { error: "生成复盘失败，请检查 OpenAI API 配置" },
      { status: 500 }
    );
  }
}
