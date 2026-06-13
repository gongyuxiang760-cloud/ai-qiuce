import { NextRequest, NextResponse } from "next/server";
import { createClient, requireAuthUser } from "@/lib/supabase/server";
import {
  getBets,
  createBet,
  updateBet,
  deleteBet,
} from "@/lib/supabase/data";
import { calculateProfit } from "@/lib/utils";
import type { BetFormData } from "@/types";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const bets = await getBets(supabase, user.id);
    return NextResponse.json(bets);
  } catch (error) {
    return handleApiError(error, "获取投注记录失败");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const data: BetFormData = await request.json();
    const profit = calculateProfit(data.stake, data.odds, data.result);

    const supabase = await createClient();
    const bet = await createBet(supabase, user.id, {
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
    return handleApiError(error, "添加投注失败");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const { id, ...data }: BetFormData & { id: string } = await request.json();
    const profit = calculateProfit(data.stake, data.odds, data.result);

    const supabase = await createClient();
    const bet = await updateBet(supabase, user.id, id, {
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
    return handleApiError(error, "修改投注失败");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const { id } = await request.json();
    const supabase = await createClient();
    await deleteBet(supabase, user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "删除投注失败");
  }
}
