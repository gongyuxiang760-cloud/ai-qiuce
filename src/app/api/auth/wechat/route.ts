import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const appId = process.env.WECHAT_APP_ID;
  const redirect = request.nextUrl.searchParams.get("redirect") || "/";

  if (!appId) {
    return NextResponse.json(
      {
        error:
          "微信登录未配置。请在 Vercel 环境变量中设置 WECHAT_APP_ID 和 WECHAT_APP_SECRET。",
      },
      { status: 503 }
    );
  }

  const callbackUrl = `${request.nextUrl.origin}/api/auth/wechat/callback`;
  const state = Buffer.from(JSON.stringify({ redirect })).toString("base64url");

  const wechatUrl = new URL("https://open.weixin.qq.com/connect/qrconnect");
  wechatUrl.searchParams.set("appid", appId);
  wechatUrl.searchParams.set("redirect_uri", callbackUrl);
  wechatUrl.searchParams.set("response_type", "code");
  wechatUrl.searchParams.set("scope", "snsapi_login");
  wechatUrl.searchParams.set("state", state);
  wechatUrl.hash = "wechat_redirect";

  return NextResponse.redirect(wechatUrl.toString());
}
