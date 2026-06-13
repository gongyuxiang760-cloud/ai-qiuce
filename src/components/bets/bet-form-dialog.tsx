"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Bet, BetFormData } from "@/types";
import { BET_TYPES, BET_RESULTS } from "@/types";
import { getToday } from "@/lib/utils";

interface BetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BetFormData) => Promise<void>;
  bet?: Bet | null;
  loading?: boolean;
}

const defaultForm: BetFormData = {
  match_name: "",
  league: "",
  bet_type: "胜平负",
  selection: "",
  odds: 1.5,
  stake: 100,
  result: "pending",
  bet_date: getToday(),
  notes: "",
};

export function BetFormDialog({
  open,
  onOpenChange,
  onSubmit,
  bet,
  loading,
}: BetFormDialogProps) {
  const [form, setForm] = useState<BetFormData>(defaultForm);

  useEffect(() => {
    if (open) {
      setForm(
        bet
          ? {
              match_name: bet.match_name,
              league: bet.league || "",
              bet_type: bet.bet_type,
              selection: bet.selection,
              odds: bet.odds,
              stake: bet.stake,
              result: bet.result,
              bet_date: bet.bet_date,
              notes: bet.notes || "",
            }
          : { ...defaultForm, bet_date: getToday() }
      );
    }
  }, [open, bet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    if (!bet) setForm({ ...defaultForm, bet_date: getToday() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bet ? "修改投注" : "添加投注"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="match_name">比赛</Label>
              <Input
                id="match_name"
                value={form.match_name}
                onChange={(e) => setForm({ ...form, match_name: e.target.value })}
                placeholder="例：曼联 vs 利物浦"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="league">联赛</Label>
              <Input
                id="league"
                value={form.league}
                onChange={(e) => setForm({ ...form, league: e.target.value })}
                placeholder="例：英超"
              />
            </div>
            <div className="space-y-2">
              <Label>投注类型</Label>
              <Select
                value={form.bet_type}
                onValueChange={(v) => setForm({ ...form, bet_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BET_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selection">选择</Label>
              <Input
                id="selection"
                value={form.selection}
                onChange={(e) => setForm({ ...form, selection: e.target.value })}
                placeholder="例：主胜"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odds">赔率</Label>
              <Input
                id="odds"
                type="number"
                step="0.01"
                min="1"
                value={form.odds}
                onChange={(e) => setForm({ ...form, odds: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stake">投注金额</Label>
              <Input
                id="stake"
                type="number"
                min="1"
                value={form.stake}
                onChange={(e) => setForm({ ...form, stake: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>结果</Label>
              <Select
                value={form.result}
                onValueChange={(v) =>
                  setForm({ ...form, result: v as BetFormData["result"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BET_RESULTS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bet_date">日期</Label>
              <Input
                id="bet_date"
                type="date"
                value={form.bet_date}
                onChange={(e) => setForm({ ...form, bet_date: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="可选备注"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : bet ? "保存修改" : "添加投注"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
