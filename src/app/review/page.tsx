"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Review } from "@/types";
import { Brain, Loader2 } from "lucide-react";

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="prose prose-sm max-w-none space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-lg font-semibold mt-4 mb-2">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-base font-semibold mt-3 mb-1">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-xl font-bold mt-4 mb-2">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="ml-4 text-sm text-muted-foreground list-disc">
              {line.slice(2)}
            </li>
          );
        }
        if (line.match(/^\d+\. /)) {
          return (
            <li key={i} className="ml-4 text-sm text-muted-foreground list-decimal">
              {line.replace(/^\d+\. /, "")}
            </li>
          );
        }
        if (line.trim() === "") return <br key={i} />;
        return (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/review");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setReviews(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const generateReview = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/review", { method: "POST" });
      if (res.ok) {
        const review = await res.json();
        setReviews((prev) => [review, ...prev]);
      } else {
        const err = await res.json();
        alert(err.error || "生成失败");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI 复盘</h1>
          <p className="text-muted-foreground text-sm mt-1">
            根据投注记录生成智能复盘分析
          </p>
        </div>
        <Button onClick={generateReview} disabled={generating}>
          {generating ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-1" />
          )}
          {generating ? "生成中..." : "生成复盘"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">暂无复盘记录</p>
            <p className="text-sm text-muted-foreground mt-1">
              添加投注记录后，点击「生成复盘」获取 AI 分析
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  复盘报告
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {new Date(review.created_at).toLocaleString("zh-CN")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownContent content={review.content} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
