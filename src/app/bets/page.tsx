"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BetTable } from "@/components/bets/bet-table";
import { BetFormDialog } from "@/components/bets/bet-form-dialog";
import type { Bet, BetFormData } from "@/types";
import { Plus } from "lucide-react";

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBets = async () => {
    try {
      const res = await fetch("/api/bets");
      const data = await res.json();
      setBets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  const handleSubmit = async (data: BetFormData) => {
    setSubmitting(true);
    try {
      if (editingBet) {
        await fetch("/api/bets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBet.id, ...data }),
        });
      } else {
        await fetch("/api/bets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setDialogOpen(false);
      setEditingBet(null);
      await fetchBets();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (bet: Bet) => {
    setEditingBet(bet);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条投注记录？")) return;
    await fetch("/api/bets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchBets();
  };

  const handleAdd = () => {
    setEditingBet(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">投注记录</h1>
          <p className="text-muted-foreground text-sm mt-1">
            管理你的所有投注记录
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          添加投注
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            全部记录 ({bets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <BetTable bets={bets} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      <BetFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingBet(null);
        }}
        onSubmit={handleSubmit}
        bet={editingBet}
        loading={submitting}
      />
    </div>
  );
}
