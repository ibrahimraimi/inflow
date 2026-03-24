import { cn } from "@inflow/core/lib/utils";

export function MetricCard({
  title,
  value,
  change,
  isNegative = false,
}: {
  title: string;
  value: string;
  change: number;
  isNegative?: boolean;
}) {
  return (
    <div className="bg-card rounded-lg border  p-3 lg:p-4 shadow-sm">
      <div className="text-[9px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 lg:mb-2">
        {title}
      </div>
      <div className="text-xl lg:text-2xl font-bold mb-0.5 lg:mb-1">{value}</div>
      {change !== 0 ? (
        <div
          className={cn(
            "text-[10px] lg:text-xs font-medium",
            change > 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
        </div>
      ) : (
        <div className="text-[10px] lg:text-xs text-muted-foreground/60">
          0%
        </div>
      )}
    </div>
  );
}
