export type BetResult = "pending" | "win" | "lose" | "push";
export type Membership = "free" | "pro" | "vip";
export type UserStatus = "active" | "suspended" | "deleted";

export interface User {
  id: string;
  nickname: string | null;
  avatar: string | null;
  email: string | null;
  membership: Membership;
  created_at: string;
  last_login: string | null;
  status: UserStatus;
  wechat_openid?: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  principal: number;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  match_name: string;
  league: string | null;
  bet_type: string;
  selection: string;
  odds: number;
  stake: number;
  result: BetResult;
  profit: number;
  bet_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  content: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DailyInsight {
  id: string;
  user_id: string;
  insight_date: string;
  today_funds: number;
  suggestions: string;
  risks: string;
  created_at: string;
}

export interface BetFormData {
  match_name: string;
  league?: string;
  bet_type: string;
  selection: string;
  odds: number;
  stake: number;
  result: BetResult;
  bet_date: string;
  notes?: string;
}

export interface AssetStats {
  principal: number;
  totalProfit: number;
  roi: number;
  currentBalance: number;
  winRate: number;
  totalBets: number;
  settledBets: number;
}

export interface UserProfileStats {
  totalBets: number;
  totalProfit: number;
  roi: number;
}

export const MEMBERSHIP_LABELS: Record<Membership, string> = {
  free: "免费会员",
  pro: "Pro 会员",
  vip: "VIP 会员",
};

export interface ProfitPoint {
  date: string;
  balance: number;
  profit: number;
}

export const BET_TYPES = [
  "胜平负",
  "让球",
  "大小球",
  "比分",
  "半全场",
  "其他",
] as const;

export const BET_RESULTS: { value: BetResult; label: string }[] = [
  { value: "pending", label: "待结算" },
  { value: "win", label: "赢" },
  { value: "lose", label: "输" },
  { value: "push", label: "走水" },
];
