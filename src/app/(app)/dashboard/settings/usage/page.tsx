"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  events: {
    label: "Events",
    color: "#3b82f6",
  },
  eventData: {
    label: "Event data",
    color: "hsl(217, 91%, 60%)",
  },
  sessionData: {
    label: "Session data",
    color: "hsl(142, 71%, 45%)",
  },
} satisfies ChartConfig;

const chartData = [
  { date: "Jan 1", events: 0, eventData: 0, sessionData: 0 },
  { date: "Jan 2", events: 6, eventData: 0, sessionData: 0 },
  { date: "Jan 7", events: 5, eventData: 0, sessionData: 0 },
  { date: "Jan 8", events: 3, eventData: 0, sessionData: 0 },
  { date: "Jan 11", events: 3, eventData: 0, sessionData: 0 },
  { date: "Jan 12", events: 1, eventData: 0, sessionData: 0 },
  { date: "Feb 1", events: 0, eventData: 0, sessionData: 0 },
];

export default function UsageSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">Usage</h1>
      </div>

      {/* Total Usage Chart */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 pt-8">
        <div className="flex justify-between items-start mb-8 px-2">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Total usage
            </h3>
            <p className="text-2xl font-bold tracking-tight">18</p>
          </div>
          <div className="space-y-1 text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Billing period
            </h3>
            <p className="text-xs font-medium text-muted-foreground">
              Jan 1, 2026 — Feb 1, 2026
            </p>
          </div>
        </div>

        <div className="h-[500px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-events)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-events)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground)/0.05)"
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Area
                dataKey="events"
                type="natural"
                fill="url(#fillEvents)"
                stroke="var(--color-events)"
                strokeWidth={2}
                dot={{
                  fill: "#3b82f6",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      {/* Grid for smaller cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usage Table */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Usage</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Type
            </p>
          </div>
          <div className="space-y-3">
            {[
              { type: "Events", total: 18, color: "bg-[#3b82f6]" },
              { type: "Event data", total: 0, color: "bg-[#3182ce]" },
              { type: "Session data", total: 0, color: "bg-[#22c55e]" },
            ].map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{item.total}</span>
                  <span className="text-muted-foreground w-8 text-right font-medium">
                    {item.total > 0 ? "100%" : "0%"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources Table */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Sources</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Name
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                <span className="font-medium">Ibrahim Raimi</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">18</span>
                <span className="text-muted-foreground w-8 text-right font-medium">
                  100%
                </span>
              </div>
            </div>
            {/* Empty space to match height of Usage card if needed */}
            <div className="h-[21px]" />
            <div className="h-[21px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
