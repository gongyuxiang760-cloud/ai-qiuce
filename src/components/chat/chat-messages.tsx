"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-medium">AI球策助手</p>
          <p className="mt-1 text-sm text-muted-foreground">
            试试问：「1000本金今天怎么买？」
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "1000本金今天怎么买？",
            "今天英超有什么推荐？",
            "如何控制投注风险？",
          ].map((q) => (
            <button
              key={q}
              className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              onClick={() => {
                const event = new CustomEvent("chat-suggestion", { detail: q });
                window.dispatchEvent(event);
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex gap-3",
            msg.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            {msg.role === "user" ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Bot className="h-4 w-4" />
          </div>
          <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm">
            <span className="inline-flex gap-1">
              <span className="animate-bounce">·</span>
              <span className="animate-bounce [animation-delay:0.1s]">·</span>
              <span className="animate-bounce [animation-delay:0.2s]">·</span>
            </span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
