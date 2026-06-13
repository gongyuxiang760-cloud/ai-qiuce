export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("email rate limit exceeded")) {
    return "邮件发送过于频繁，请稍后再试。";
  }
  if (lower.includes("invalid login credentials")) {
    return "邮箱或密码错误。若刚注册，请确认 Supabase 已关闭「Confirm email」；若用验证码注册过，请用「忘记密码」重设密码。";
  }
  if (lower.includes("email not confirmed")) {
    return "邮箱尚未验证。请到 Supabase → Authentication → Email 关闭「Confirm email」，或在邮箱中点击确认链接。";
  }
  if (lower.includes("user already registered")) {
    return "该邮箱已注册，请直接登录。";
  }
  if (lower.includes("password should be at least")) {
    return "密码至少需要 6 位。";
  }
  if (lower.includes("token has expired") || lower.includes("otp_expired")) {
    return "链接已过期，请重新操作。";
  }
  if (lower.includes("invalid otp")) {
    return "验证码错误，请检查后重试。";
  }

  return message;
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "登录回调失败，请重新登录",
};
