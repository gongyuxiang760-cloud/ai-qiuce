import { NextRequest, NextResponse } from "next/server";
import {
  getProfile,
  getBets,
  getChatMessages,
  createChatMessage,
} from "@/lib/supabase/client";
import { generateChatResponse } from "@/lib/ai/openai";

export async function GET() {
  try {
    const messages = await getChatMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get chat messages error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }

    await createChatMessage("user", message);

    const [profile, bets] = await Promise.all([getProfile(), getBets()]);
    const recentBets = bets.slice(0, 10);

    const reply = await generateChatResponse(message, {
      profile,
      recentBets,
    });

    const assistantMsg = await createChatMessage("assistant", reply);

    return NextResponse.json(assistantMsg);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "AI 回复失败，请检查 OpenAI API 配置" },
      { status: 500 }
    );
  }
}
