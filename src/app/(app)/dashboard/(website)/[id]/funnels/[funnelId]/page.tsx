"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import { useWebsite } from "@/hooks/use-website";
import { useFunnel } from "@/hooks/use-funnels";
import type { FunnelEvaluationResult } from "@/configs/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  const { from, to } = getDateRangeParams();

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
    <div className="lg:mt-8 mt-10 max-w-5xl mx-auto space-y-6 pb-24">
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Funnel Conversion</CardTitle>
            <CardDescription>Visual breakdown of users progressing through each step.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="shortName" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                         <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                           <p className="font-semibold mb-2">{data.name}</p>
                           <div className="space-y-1">
                             <div className="flex justify-between gap-4">
                               <span className="text-muted-foreground">Completed:</span>
                               <span className="font-medium">{data.count} users</span>
                             </div>
                             <div className="flex justify-between gap-4">
                               <span className="text-muted-foreground">Conv. Rate:</span>
                               <span className="font-medium text-emerald-500">{data.conversionRate}%</span>
                             </div>
                             {data.shortName !== "S1" && (
                               <div className="flex justify-between gap-4 pt-1 mt-1 border-t">
                                 <span className="text-muted-foreground">Drop-off:</span>
                                 <span className="font-medium text-destructive">{data.dropoffRate}% ({data.dropoff})</span>
                               </div>
                             )}
                           </div>
                         </div>
                      )
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                   {chartData.map((entry: ChartDataEntry, index: number) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={1 - (index * 0.15)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
