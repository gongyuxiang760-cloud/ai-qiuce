-- AI球策 Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中执行此脚本

-- 用户配置表（本金）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  principal NUMERIC NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 投注记录表
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_name TEXT NOT NULL,
  league TEXT,
  bet_type TEXT NOT NULL DEFAULT '胜平负',
  selection TEXT NOT NULL,
  odds NUMERIC NOT NULL,
  stake NUMERIC NOT NULL,
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pending', 'win', 'lose', 'push')),
  profit NUMERIC NOT NULL DEFAULT 0,
  bet_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 每日洞察（今日建议/风险）
CREATE TABLE IF NOT EXISTS daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_date DATE NOT NULL,
  today_funds NUMERIC NOT NULL DEFAULT 0,
  suggestions TEXT NOT NULL DEFAULT '',
  risks TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, insight_date)
);

-- AI 复盘记录
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI 聊天消息
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_bet_date ON bets(bet_date);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_insights_user_date ON daily_insights(user_id, insight_date);

-- 插入默认用户配置
INSERT INTO profiles (user_id, principal)
VALUES ('00000000-0000-0000-0000-000000000001', 1000)
ON CONFLICT (user_id) DO NOTHING;

-- 启用 Row Level Security（可选，单用户模式可放宽）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 允许匿名访问策略（单用户演示模式）
CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bets" ON bets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to daily_insights" ON daily_insights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
