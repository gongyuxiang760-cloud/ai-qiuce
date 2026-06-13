import { createHash } from "crypto";

const AUTH_DOMAIN = "account.aiqiuce.app";

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();

  if (trimmed.length < 3 || trimmed.length > 20) {
    return "账号长度需在 3～20 个字符之间";
  }

  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(trimmed)) {
    return "账号只能包含中文、字母、数字和下划线";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.length < 6) {
    return "密码至少需要 6 位";
  }
  return null;
}

/** 将账号映射为 Supabase 内部标识（用户不可见） */
export function usernameToAuthEmail(username: string): string {
  const normalized = normalizeUsername(username);
  const hash = createHash("sha256").update(normalized).digest("hex").slice(0, 24);
  return `u_${hash}@${AUTH_DOMAIN}`;
}

export function getDisplayUsername(
  metadata?: { username?: string } | null
): string | null {
  return metadata?.username?.trim() || null;
}
