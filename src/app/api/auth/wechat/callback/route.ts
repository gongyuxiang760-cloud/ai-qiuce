import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface WeChatTokenResponse {
  access_token?: string;
  openid?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WeChatUserInfo {
  nickname?: string;
  headimgurl?: string;
  errcode?: number;
  errmsg?: string;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=wechat_denied`);
  }

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${origin}/login?error=wechat_not_configured`);
  }

  let redirect = "/";
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
      redirect = parsed.redirect || "/";
    } catch {
      // ignore
    }
  }

  try {
    const tokenRes = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
    );
    const tokenData: WeChatTokenResponse = await tokenRes.json();

    if (tokenData.errcode || !tokenData.openid) {
      return NextResponse.redirect(`${origin}/login?error=wechat_token_failed`);
    }

    const userRes = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
    );
    const wechatUser: WeChatUserInfo = await userRes.json();

    const admin = createAdminClient();
    const email = `wechat_${tokenData.openid}@wechat.aiqiuce.app`;

    const { data: existingUsers } = await admin
      .from("users")
      .select("id")
      .eq("wechat_openid", tokenData.openid)
      .maybeSingle();

    let userId = existingUsers?.id;

    if (!userId) {
      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: wechatUser.nickname || "微信用户",
            avatar_url: wechatUser.headimgurl,
            provider: "wechat",
            wechat_openid: tokenData.openid,
          },
        });

      if (createError) {
        const { data: listData } = await admin.auth.admin.listUsers();
        const found = listData.users.find((u) => u.email === email);
        if (!found) {
          return NextResponse.redirect(`${origin}/login?error=wechat_create_failed`);
        }
        userId = found.id;
      } else {
        userId = newUser.user.id;
      }

      await admin.from("users").upsert({
        id: userId,
        email,
        nickname: wechatUser.nickname || "微信用户",
        avatar: wechatUser.headimgurl,
        wechat_openid: tokenData.openid,
        last_login: new Date().toISOString(),
      });
    } else {
      await admin.from("users").update({
        nickname: wechatUser.nickname,
        avatar: wechatUser.headimgurl,
        last_login: new Date().toISOString(),
      }).eq("id", userId);
    }

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData.properties?.hashed_token) {
      return NextResponse.redirect(`${origin}/login?error=wechat_session_failed`);
    }

    const callbackUrl = new URL(`${origin}/auth/callback`);
    callbackUrl.searchParams.set("token_hash", linkData.properties.hashed_token);
    callbackUrl.searchParams.set("type", "email");
    callbackUrl.searchParams.set("next", redirect);

    return NextResponse.redirect(callbackUrl.toString());
  } catch (error) {
    console.error("WeChat auth error:", error);
    return NextResponse.redirect(`${origin}/login?error=wechat_unknown`);
  }
}
