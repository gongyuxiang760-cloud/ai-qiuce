export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("email signups are disabled")) {
    return "注册功能未开启。请到 Supabase → Authentication → Providers → Email，打开 Enable email provider。";
  }
  if (lower.includes("invalid login credentials")) {
    return "账号或密码错误，请检查后重试。";
  }
  if (lower.includes("email not confirmed")) {
    return "账号尚未激活，请联系管理员。";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "该账号已注册，请直接登录。";
  }
  if (lower.includes("password should be at least")) {
    return "密码至少需要 6 位。";
  }

  return message;
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "登录回调失败，请重新登录",
};
