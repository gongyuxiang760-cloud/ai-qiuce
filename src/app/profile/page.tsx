"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { MEMBERSHIP_LABELS, type User, type UserProfileStats } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  User as UserIcon,
  Mail,
  Crown,
  TrendingUp,
  BarChart3,
  ListOrdered,
  LogOut,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<UserProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile(data.user);
          setStats(data.stats);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName =
    profile?.nickname || user?.user_metadata?.full_name || "用户";
  const displayEmail = profile?.email || user?.email || "";
  const avatar =
    profile?.avatar || user?.user_metadata?.avatar_url || null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">个人中心</h1>
        <p className="text-muted-foreground text-sm mt-1">管理你的账户信息</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="h-16 w-16 rounded-full object-cover border"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {displayEmail}
              </div>
              <Badge variant="secondary" className="mt-2">
                <Crown className="h-3 w-3 mr-1" />
                {MEMBERSHIP_LABELS[profile?.membership || "free"]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ListOrdered className="h-4 w-4" />
              累计投注
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalBets ?? 0} 笔</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              累计收益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                (stats?.totalProfit ?? 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(stats?.totalProfit ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                (stats?.roi ?? 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercent(stats?.roi ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
