"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart
} from "recharts";

import { useWebsite } from "@/hooks/use-website";
import { useFunnel } from "@/hooks/use-funnels";
import type { FunnelEvaluationResult } from "@inflow/types";
import { Button } from "@inflow/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@inflow/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@inflow/ui";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@inflow/ui";
import { Badge } from "@inflow/ui";

type ChartDataEntry = {
  name: string;
  shortName: string;
  count: number;
  dropoff: number;
  dropoffRate: string;
  conversionRate: string;
  type: string;
  value: string;
};

export default function FunnelReportPage() {
  const params = useParams();
  const chartConfig = {
    count: {
      label: "Completed",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const websiteId = params.id as string;
  const funnelId = params.funnelId as string;

  const [dateRange, setDateRange] = useState("last_30_days");

  const getDateRangeParams = () => {
    const today = new Date();
    const to = today.toISOString();
    let from = new Date();

    switch (dateRange) {
      case "last_7_days":
        from.setDate(today.getDate() - 7);
        break;
      case "last_30_days":
        from.setDate(today.getDate() - 30);
        break;
      case "last_90_days":
        from.setDate(today.getDate() - 90);
        break;
      default:
        from.setDate(today.getDate() - 30);
    }

    return { from: from.toISOString(), to };
  };

  const { from, to } = useMemo(() => {
    return getDateRangeParams();
  }, [dateRange]);

  const { website, isLoading: websiteLoading } = useWebsite(websiteId);
  const { funnel, evaluation, isLoading: funnelLoading } = useFunnel(websiteId, funnelId, from, to);

  if (websiteLoading || funnelLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website || !funnel) {
    return (
      <div className="lg:mt-8 mt-10 w-full text-center py-12">
        <p className="text-muted-foreground">Funnel not found</p>
        <Link href={`/dashboard/${websiteId}/funnels`}>
          <Button variant="link" className="mt-4">
            Back to Funnels
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate conversion rates
  const maxCount = evaluation?.[0]?.count || 0;
  
  const chartData = evaluation?.map((step: FunnelEvaluationResult, idx: number) => {
    const prevCount = idx === 0 ? step.count : evaluation[idx - 1].count;
    const dropoff = prevCount > 0 ? prevCount - step.count : 0;
    const dropoffRate = prevCount > 0 ? ((dropoff / prevCount) * 100).toFixed(1) : "0";
    const conversionRate = maxCount > 0 ? ((step.count / maxCount) * 100).toFixed(1) : "0";
    
    return {
      name: `Step ${step.step}: ${step.value}`,
      shortName: `S${step.step}`,
      count: step.count,
      dropoff,
      dropoffRate,
      conversionRate,
      type: step.type,
      value: step.value
    };
  }) || [];

  const overallConversion = maxCount > 0 && evaluation && evaluation.length > 0
    ? ((evaluation[evaluation.length - 1].count / maxCount) * 100).toFixed(1) 
    : "0";

  return (
    <div className="lg:mt-8 mt-10 space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-6">
        <div>
          <Link
            href={`/dashboard/${websiteId}/funnels`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Funnels</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{funnel.name}</h1>
            <Badge variant="secondary">{overallConversion}% Conversion Rate</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="last_30_days">Last 30 days</SelectItem>
              <SelectItem value="last_90_days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 rounded-lg">
          <CardHeader className="border-b">
            <CardTitle>Funnel Conversion</CardTitle>
            <CardDescription>Visual breakdown of users progressing through each step.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 h-[400px]">
             <ChartContainer
                config={chartConfig}
                className="aspect-auto h-full w-full"
              >
              <AreaChart 
                accessibilityLayer
                data={chartData} 
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="shortName" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`} 
                />
                <ChartTooltip 
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value, payload) => {
                        return payload?.[0]?.payload?.name || value;
                      }}
                      indicator="dot"
                      formatter={(value, name, item) => (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[--color-count]" />
                            <span className="text-muted-foreground">{chartConfig.count.label}</span>
                          </div>
                          <span className="font-mono font-medium">{Number(value).toLocaleString()}</span>
                          
                          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t w-full justify-between">
                            <span className="text-muted-foreground text-[10px] uppercase">Conv. Rate</span>
                            <span className="font-bold text-emerald-500">{item.payload.conversionRate}%</span>
                          </div>
                          {item.payload.shortName !== "S1" && (
                            <div className="flex items-center gap-2 w-full justify-between">
                              <span className="text-muted-foreground text-[10px] uppercase">Drop-off</span>
                              <span className="font-bold text-destructive">-{item.payload.dropoffRate}%</span>
                            </div>
                          )}
                        </>
                      )}
                    />
                  }
                />
                <Area 
                  dataKey="count" 
                  type="natural"
                  fill="url(#fillCount)"
                  fillOpacity={0.4}
                  stroke="var(--color-count)"
                  stackId="a"
                  animationDuration={1500}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Step Breakdown</CardTitle>
            <CardDescription>Detailed statistics per step.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {chartData.map((step: ChartDataEntry, index: number) => (
               <div key={index} className="space-y-2">
                 <div className="flex items-start justify-between">
                   <div>
                     <p className="text-sm font-medium leading-none flex items-center gap-2">
                       <span className="text-muted-foreground text-xs">{step.shortName}</span>
                       <span className="truncate max-w-[120px]" title={step.name}>{step.value}</span>
                     </p>
                     <p className="text-xs text-muted-foreground mt-1 px-6">{step.type}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-medium">{step.count}</p>
                     <p className="text-xs text-emerald-500">{step.conversionRate}%</p>
                   </div>
                 </div>
                 {index < chartData.length - 1 && (
                   <div className="pl-6 py-2 border-l-2 border-dashed ml-2 border-destructive/30">
                      <div className="text-xs text-destructive bg-destructive/10 inline-block px-2 py-0.5 rounded">
                        ↘ {chartData[index + 1].dropoffRate}% drop-off
                      </div>
                   </div>
                 )}
               </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
