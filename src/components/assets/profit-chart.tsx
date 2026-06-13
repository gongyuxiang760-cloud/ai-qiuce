"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ProfitPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ProfitChartProps {
  data: ProfitPoint[];
  principal: number;
}

export function ProfitChart({ data, principal }: ProfitChartProps) {
  if (data.length <= 1) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        暂无足够数据绘制收益曲线
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `¥${v}`}
          className="text-muted-foreground"
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "余额"]}
          labelFormatter={(label) => `日期：${label}`}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <ReferenceLine
          y={principal}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="5 5"
          label={{ value: "本金", position: "right", fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
