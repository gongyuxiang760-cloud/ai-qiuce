import type { SupabaseClient } from "@supabase/supabase-js";
import type { Bet, Profile, Review, ChatMessage, DailyInsight, User } from "@/types";

type DbClient = SupabaseClient;

export async function getUserProfile(
  supabase: DbClient,
  userId: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function getFinancialProfile(
  supabase: DbClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertFinancialProfile(
  supabase: DbClient,
  userId: string,
  principal: number
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: userId, principal, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBets(supabase: DbClient, userId: string): Promise<Bet[]> {
  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .order("bet_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTodayBets(
  supabase: DbClient,
  userId: string
): Promise<Bet[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .eq("bet_date", today)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createBet(
  supabase: DbClient,
  userId: string,
  bet: Omit<Bet, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Bet> {
  const { data, error } = await supabase
    .from("bets")
    .insert({ ...bet, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBet(
  supabase: DbClient,
  userId: string,
  id: string,
  updates: Partial<Bet>
): Promise<Bet> {
  const { data, error } = await supabase
    .from("bets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBet(
  supabase: DbClient,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("bets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getTodayInsight(
  supabase: DbClient,
  userId: string
): Promise<DailyInsight | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("daily_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("insight_date", today)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertDailyInsight(
  supabase: DbClient,
  userId: string,
  insight: Omit<DailyInsight, "id" | "user_id" | "created_at">
): Promise<DailyInsight> {
  const { data, error } = await supabase
    .from("daily_insights")
    .upsert({ ...insight, user_id: userId }, { onConflict: "user_id,insight_date" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReviews(
  supabase: DbClient,
  userId: string
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createReview(
  supabase: DbClient,
  userId: string,
  review: Omit<Review, "id" | "user_id" | "created_at">
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ ...review, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChatMessages(
  supabase: DbClient,
  userId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createChatMessage(
  supabase: DbClient,
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: userId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserStats(supabase: DbClient, userId: string) {
  const bets = await getBets(supabase, userId);
  const settled = bets.filter((b) => b.result !== "pending");
  const totalStake = settled.reduce((s, b) => s + b.stake, 0);
  const totalProfit = settled.reduce((s, b) => s + b.profit, 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

  return {
    totalBets: bets.length,
    totalProfit,
    roi,
  };
}
