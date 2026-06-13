import { cn, formatCurrency } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-3">
        <p
          className={cn(
            "text-2xl font-bold",
            trend === "up" && "text-green-600",
            trend === "down" && "text-red-600"
          )}
        >
          {value}
        </p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function MoneyStatCard({
  title,
  amount,
  description,
  icon,
  trend,
}: Omit<StatCardProps, "value"> & { amount: number }) {
  return (
    <StatCard
      title={title}
      value={formatCurrency(amount)}
      description={description}
      icon={icon}
      trend={trend}
    />
  );
}
