"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { formatAuthError, AUTH_ERROR_MESSAGES } from "@/lib/auth-errors";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError && AUTH_ERROR_MESSAGES[urlError]) {
      setError(AUTH_ERROR_MESSAGES[urlError]);
    }
  }, [searchParams]);

  const finishLogin = () => {
    window.location.href = redirect;
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const trimmedEmail = email.trim();

    if (isSignup) {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (signupError) {
        setLoading(false);
        setError(formatAuthError(signupError.message));
        if (signupError.message.toLowerCase().includes("already registered")) {
          setIsSignup(false);
        }
        return;
      }

      // Supabase 防枚举：邮箱已存在时 identities 为空
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        setLoading(false);
        setError("该邮箱已注册，请直接登录。若忘记密码，可点「忘记密码」。");
        setIsSignup(false);
        return;
      }

      if (data.session) {
        setLoading(false);
        finishLogin();
        return;
      }

      setLoading(false);
      setMessage(
        "注册成功，但需邮箱验证后才能登录。请在 Supabase 关闭 Confirm email，或去邮箱点确认链接后再登录。"
      );
      setIsSignup(false);
      return;
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError(formatAuthError(loginError.message));
      return;
    }

    if (data.session) {
      finishLogin();
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("请先输入邮箱，再点忘记密码。");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmedEmail,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/login")}`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(formatAuthError(resetError.message));
    } else {
      setMessage("若该邮箱已注册，重置密码邮件已发送（需配置 SMTP 才能收到）。");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">登录 AI球策</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          使用邮箱 + 密码登录
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg bg-primary/10 text-primary text-sm p-3">
            {message}
          </div>
        )}

        <form onSubmit={handlePasswordAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@qq.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder={isSignup ? "设置密码（至少6位）" : "输入密码"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isSignup ? (
              <UserPlus className="h-4 w-4 mr-2" />
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            {isSignup ? "注册" : "登录"}
          </Button>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setMessage("");
              }}
            >
              {isSignup ? "已有账号？去登录" : "没有账号？去注册"}
            </Button>
            {!isSignup && (
              <Button
                type="button"
                variant="link"
                className="w-full text-sm text-muted-foreground"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                忘记密码？
              </Button>
            )}
          </div>
        </form>

        {isSignup && (
          <p className="text-xs text-muted-foreground text-center">
            注册成功后若无法登录，请到 Supabase 关闭 Email 的「Confirm email」选项。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
