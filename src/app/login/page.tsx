import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Trophy } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Trophy className="h-5 w-5 text-primary" />
        <span className="text-sm">AI球策 · 智能足球投注策略</span>
      </div>
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-xl bg-muted" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
