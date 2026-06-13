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

    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const authEmail = usernameToAuthEmail(username);
    const supabase = await createClient();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (loginError) {
      return NextResponse.json(
        { error: formatAuthError(loginError.message) },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
