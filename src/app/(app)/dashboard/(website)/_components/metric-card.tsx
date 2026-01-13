import { cn } from "@/lib/utils";

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
    <div className="bg-card rounded-lg border p-4">
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {change !== 0 && (
        <div
          className={cn(
            "text-xs",
            change > 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
        </div>
      )}
      {change === 0 && <div className="text-xs text-muted-foreground">0%</div>}
    </div>
  );
}
