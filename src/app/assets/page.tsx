"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/shared/stat-card";
import { ProfitChart } from "@/components/assets/profit-chart";
import type { AssetStats, ProfitPoint } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Wallet, TrendingUp, Target, BarChart3, Pencil, Check, X } from "lucide-react";

export default function AssetsPage() {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [profitCurve, setProfitCurve] = useState<ProfitPoint[]>([]);
  const [principal, setPrincipal] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("1000");
  const [saving, setSaving] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      setStats(data.stats);
      setProfitCurve(data.profitCurve);
      setPrincipal(data.principal);
      setEditValue(String(data.principal));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const savePrincipal = async () => {
    const value = parseFloat(editValue);
    if (!value || value <= 0) return;
    setSaving(true);
    try {
      await fetch("/api/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ principal: value }),
      });
      setEditing(false);
      await fetchAssets();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">资产</h1>
        <p className="text-muted-foreground text-sm mt-1">
          查看本金、ROI 和收益曲线
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            本金设置
          </CardTitle>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              修改
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={savePrincipal} disabled={saving}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="flex items-end gap-3 max-w-xs">
              <div className="flex-1 space-y-2">
                <Label htmlFor="principal">本金（元）</Label>
                <Input
                  id="principal"
                  type="number"
                  min="1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <p className="text-3xl font-bold">{formatCurrency(principal)}</p>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="当前余额"
            value={formatCurrency(stats.currentBalance)}
            icon={Wallet}
            trend={stats.totalProfit >= 0 ? "up" : "down"}
          />
          <StatCard
            title="ROI"
            value={formatPercent(stats.roi)}
            description="投资回报率"
            icon={TrendingUp}
            trend={stats.roi >= 0 ? "up" : "down"}
          />
          <StatCard
            title="总盈亏"
            value={formatCurrency(stats.totalProfit)}
            icon={BarChart3}
            trend={stats.totalProfit >= 0 ? "up" : "down"}
          />
          <StatCard
            title="胜率"
            value={`${stats.winRate.toFixed(1)}%`}
            description={`${stats.settledBets}/${stats.totalBets} 笔已结算`}
            icon={Target}
          />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">收益曲线</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 animate-pulse rounded bg-muted" />
          ) : (
            <ProfitChart data={profitCurve} principal={principal} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
