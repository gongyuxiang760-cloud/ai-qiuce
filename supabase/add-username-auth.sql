-- 账号密码登录：为 users 表增加 username 字段
-- 在 Supabase SQL Editor 执行

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
  ON public.users (username)
  WHERE username IS NOT NULL;

-- 更新新用户触发器，写入 username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_username TEXT;
  normalized_username TEXT;
BEGIN
  meta_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name'
  );
  normalized_username := lower(trim(meta_username));

  INSERT INTO public.users (id, email, username, nickname, avatar, last_login)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(normalized_username, ''),
    COALESCE(meta_username, split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.users.username),
    nickname = COALESCE(EXCLUDED.nickname, public.users.nickname),
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    last_login = now();

  INSERT INTO public.profiles (user_id, principal)
  VALUES (NEW.id, 1000)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
