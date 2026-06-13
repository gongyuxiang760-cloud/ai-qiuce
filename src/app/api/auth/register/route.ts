import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  usernameToAuthEmail,
  validatePassword,
  validateUsername,
} from "@/lib/auth/username";
import { formatAuthError } from "@/lib/auth-errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "两次输入的密码不一致" }, { status: 400 });
    }

    const displayUsername = username.trim();
    const authEmail = usernameToAuthEmail(username);
    const supabase = await createClient();

    const { data, error: signupError } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: { username: displayUsername },
      },
    });

    if (signupError) {
      const message = signupError.message.toLowerCase();
      if (message.includes("already") || message.includes("registered")) {
        return NextResponse.json(
          { error: "该账号已被注册，请直接登录" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: formatAuthError(signupError.message) },
        { status: 400 }
      );
    }

    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      return NextResponse.json(
        { error: "该账号已被注册，请直接登录" },
        { status: 409 }
      );
    }

    if (data.session) {
      return NextResponse.json({ success: true });
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (loginError) {
      return NextResponse.json(
        {
          error:
            "注册成功但无法自动登录。请到 Supabase 开启 Email 提供商，并关闭 Confirm email。",
          detail: formatAuthError(loginError.message),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "注册失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
