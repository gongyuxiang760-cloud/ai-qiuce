import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeUsername,
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
    const normalized = normalizeUsername(username);
    const authEmail = usernameToAuthEmail(username);
    const admin = createAdminClient();

    const { data: existingUser } = await admin
      .from("users")
      .select("id")
      .eq("username", normalized)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: "该账号已被注册，请直接登录" }, { status: 409 });
    }

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: { username: displayUsername },
      });

    if (createError) {
      const message = createError.message.toLowerCase();
      if (message.includes("already") || message.includes("registered")) {
        return NextResponse.json(
          { error: "该账号已被注册，请直接登录" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: formatAuthError(createError.message) },
        { status: 400 }
      );
    }

    if (created.user) {
      await admin
        .from("users")
        .upsert(
          {
            id: created.user.id,
            email: authEmail,
            username: normalized,
            nickname: displayUsername,
            last_login: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      await admin
        .from("profiles")
        .upsert({ user_id: created.user.id, principal: 1000 }, { onConflict: "user_id" });
    }

    const supabase = await createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (loginError) {
      return NextResponse.json(
        {
          error:
            "账号已创建，但自动登录失败。请开启 Supabase Email 提供商后重试登录。",
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
