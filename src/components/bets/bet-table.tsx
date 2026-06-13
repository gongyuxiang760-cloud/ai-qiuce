import type { Bet } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

interface BetTableProps {
  bets: Bet[];
  onEdit: (bet: Bet) => void;
  onDelete: (id: string) => void;
}

function resultBadge(result: string) {
  const map: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "secondary" }> = {
    win: { label: "赢", variant: "success" },
    lose: { label: "输", variant: "destructive" },
    push: { label: "走水", variant: "warning" },
    pending: { label: "待结算", variant: "secondary" },
  };
  const cfg = map[result] || map.pending;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function BetTable({ bets, onEdit, onDelete }: BetTableProps) {
  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">暂无投注记录</p>
        <p className="text-sm mt-1">点击「添加投注」开始记录</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">日期</th>
            <th className="pb-3 pr-4 font-medium">比赛</th>
            <th className="pb-3 pr-4 font-medium">类型</th>
            <th className="pb-3 pr-4 font-medium">选择</th>
            <th className="pb-3 pr-4 font-medium">赔率</th>
            <th className="pb-3 pr-4 font-medium">金额</th>
            <th className="pb-3 pr-4 font-medium">结果</th>
            <th className="pb-3 pr-4 font-medium">盈亏</th>
            <th className="pb-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => (
            <tr key={bet.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="py-3 pr-4 whitespace-nowrap">{formatDate(bet.bet_date)}</td>
              <td className="py-3 pr-4">
                <div className="font-medium">{bet.match_name}</div>
                {bet.league && (
                  <div className="text-xs text-muted-foreground">{bet.league}</div>
                )}
              </td>
              <td className="py-3 pr-4">{bet.bet_type}</td>
              <td className="py-3 pr-4">{bet.selection}</td>
              <td className="py-3 pr-4">{bet.odds.toFixed(2)}</td>
              <td className="py-3 pr-4">{formatCurrency(bet.stake)}</td>
              <td className="py-3 pr-4">{resultBadge(bet.result)}</td>
              <td
                className={`py-3 pr-4 font-medium ${
                  bet.profit > 0
                    ? "text-green-600"
                    : bet.profit < 0
                    ? "text-red-600"
                    : ""
                }`}
              >
                {bet.result === "pending" ? "-" : formatCurrency(bet.profit)}
              </td>
              <td className="py-3">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(bet)}
                    aria-label="编辑"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(bet.id)}
                    aria-label="删除"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
