"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListOrdered,
  Wallet,
  Brain,
  MessageCircle,
  Trophy,
  User,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "首页", icon: Home, public: true },
  { href: "/bets", label: "投注记录", icon: ListOrdered, public: false },
  { href: "/assets", label: "资产", icon: Wallet, public: false },
  { href: "/review", label: "AI复盘", icon: Brain, public: false },
  { href: "/chat", label: "AI聊天", icon: MessageCircle, public: false },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-4 w-4" />
          </div>
          <span>AI球策</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">我的</span>
              </Button>
            </Link>
          ) : !loading ? (
            <Link href="/login">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                登录
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <nav className="md:hidden border-t">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 text-xs",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href={user ? "/profile" : "/login"}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 text-xs",
              pathname === "/profile" || pathname === "/login"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {user ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            {user ? "我的" : "登录"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
