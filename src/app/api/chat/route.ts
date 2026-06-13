import { NextRequest, NextResponse } from "next/server";
import { createClient, requireAuthUser } from "@/lib/supabase/server";
import {
  getFinancialProfile,
  getBets,
  getChatMessages,
  createChatMessage,
} from "@/lib/supabase/data";
import { generateChatResponse } from "@/lib/ai/deepseek";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const messages = await getChatMessages(supabase, user.id);
    return NextResponse.json(messages);
  } catch (error) {
    return handleApiError(error, "获取聊天记录失败");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }

    const supabase = await createClient();
    await createChatMessage(supabase, user.id, "user", message);

    const [profile, bets] = await Promise.all([
      getFinancialProfile(supabase, user.id),
      getBets(supabase, user.id),
    ]);

    const reply = await generateChatResponse(message, {
      profile,
      recentBets: bets.slice(0, 10),
    });

    const assistantMsg = await createChatMessage(
      supabase,
      user.id,
      "assistant",
      reply
    );

    return NextResponse.json(assistantMsg);
  } catch (error) {
    return handleApiError(error, "AI 回复失败，请检查 DeepSeek API 配置");
  }
}
