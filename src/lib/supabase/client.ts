import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Bet, Profile, Review, ChatMessage, DailyInsight } from "@/types";

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "缺少 Supabase 配置，请设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

export function getUserId(): string {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_USER_ID ||
    "00000000-0000-0000-0000-000000000001"
  );
}

// Profile
export async function getProfile(): Promise<Profile | null> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertProfile(principal: number): Promise<Profile> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
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

// Bets
export async function getBets(): Promise<Bet[]> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .order("bet_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTodayBets(): Promise<Bet[]> {
  const userId = getUserId();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await getSupabase()
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .eq("bet_date", today)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createBet(
  bet: Omit<Bet, "id" | "user_id" | "created_at" | "updated_at" | "profit"> & {
    profit?: number;
  }
): Promise<Bet> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("bets")
    .insert({ ...bet, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBet(
  id: string,
  updates: Partial<Bet>
): Promise<Bet> {
  const { data, error } = await getSupabase()
    .from("bets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBet(id: string): Promise<void> {
  const { error } = await getSupabase().from("bets").delete().eq("id", id);
  if (error) throw error;
}

// Daily Insights
export async function getTodayInsight(): Promise<DailyInsight | null> {
  const userId = getUserId();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await getSupabase()
    .from("daily_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("insight_date", today)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertDailyInsight(
  insight: Omit<DailyInsight, "id" | "user_id" | "created_at">
): Promise<DailyInsight> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("daily_insights")
    .upsert(
      { ...insight, user_id: userId },
      { onConflict: "user_id,insight_date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reviews
export async function getReviews(): Promise<Review[]> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createReview(
  review: Omit<Review, "id" | "user_id" | "created_at">
): Promise<Review> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("reviews")
    .insert({ ...review, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Chat
export async function getChatMessages(): Promise<ChatMessage[]> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createChatMessage(
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  const userId = getUserId();
  const { data, error } = await getSupabase()
    .from("chat_messages")
    .insert({ user_id: userId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function clearChatMessages(): Promise<void> {
  const userId = getUserId();
  const { error } = await getSupabase()
    .from("chat_messages")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}
