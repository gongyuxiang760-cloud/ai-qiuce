"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessages } from "@/components/chat/chat-messages";
import type { ChatMessage } from "@/types";
import { Send, Trash2 } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      setMessages(data);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") setInput(detail);
    };
    window.addEventListener("chat-suggestion", handler);
    return () => window.removeEventListener("chat-suggestion", handler);
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: "",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const assistantMsg = await res.json();
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
          return [
            ...withoutTemp,
            { ...tempUserMsg, id: `user-${Date.now()}` },
            assistantMsg,
          ];
        });
        await fetchMessages();
      } else {
        const err = await res.json();
        alert(err.error || "发送失败");
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI 聊天</h1>
        <p className="text-muted-foreground text-sm mt-1">
          向 AI 球策助手咨询投注策略
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        {initialLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ChatMessages messages={messages} loading={loading} />
        )}

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题，例如：1000本金今天怎么买？"
              rows={2}
              className="resize-none"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="shrink-0 self-end"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            按 Enter 发送，Shift+Enter 换行
          </p>
        </div>
      </Card>
    </div>
  );
}
