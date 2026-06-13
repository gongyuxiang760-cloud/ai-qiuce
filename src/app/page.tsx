"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyStatCard } from "@/components/shared/stat-card";
import { Wallet, Lightbulb, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DailyData {
  todayFunds: number;
  suggestions: string;
  risks: string;
}

export default function HomePage() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/daily-insight");
      const json = await res.json();
      setData(json);
    } catch {
      setData({
        todayFunds: 1000,
        suggestions: "建议关注主流联赛，控制单场投注比例。",
        risks: "注意冷门赛事风险，避免追高赔率。",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshInsight = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/daily-insight", { method: "POST" });
      const json = await res.json();
      setData(json);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">今日概览</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshInsight}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          刷新建议
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MoneyStatCard
          title="今日资金"
          amount={data?.todayFunds ?? 0}
          description="可用投注资金"
          icon={Wallet}
          trend="neutral"
        />
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-primary" />
              今日建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {data?.suggestions}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              今日风险
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {data?.risks}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bets">添加投注</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/chat">AI 咨询</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/review">生成复盘</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/assets">查看资产</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">使用提示</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· 在「资产」页设置你的本金</li>
              <li>· 在「投注记录」页记录每笔投注</li>
              <li>· 使用「AI聊天」获取投注建议</li>
              <li>· 定期使用「AI复盘」分析表现</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
