"use client";

import useSWR from "swr";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcherWithParams } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsData } from "@/configs/types";
import { DataMap } from "@/app/(app)/dashboard/(website)/_components/data-map";
import { DataTable } from "@/app/(app)/dashboard/(website)/_components/data-table";
import { MetricCard } from "@/app/(app)/dashboard/(website)/_components/metric-card";
import { ChartAreaInteractive } from "@/app/(app)/dashboard/(website)/_components/chart";

type PublicAnalyticsData = AnalyticsData & {
  website: {
    websiteName: string;
    domain: string;
  };
};

export default function PublicWebsiteDetailPage() {
  const params = useParams();
  const token = params.token as string;

  const [dateRange, setDateRange] = useState("last_7_days");

  const { data, error, isLoading, isValidating } = useSWR<PublicAnalyticsData>(
    token ? [`/api/public/${token}/analytics`, { range: dateRange }] : null,
    fetcherWithParams,
    { keepPreviousData: true }
  );

  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || (!isLoading && !data)) {
    return (
      <div className="lg:mt-8 mt-10 w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground px-4">
            {error?.info?.error || "Public dashboard not found or is no longer available"}
          </p>
        </div>
      </div>
    );
  }

  const website = data!.website;
  const analytics = data!;

  return (
    <div className="mx-auto max-w-7xl lg:mt-8 mt-10 pb-10">
      <div className="mb-8 border-b pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-12 sm:size-10 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm bg-primary/10 text-primary border border-primary/20"
              )}
            >
              <span className="text-2xl sm:text-xl">
                {website.websiteName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {website.websiteName}
              </h1>
              <p className="text-sm text-muted-foreground">{website.domain}</p>
            </div>
            <div className="ml-2 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border">
              Public View
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6 pt-2">
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isValidating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse mr-2">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8">
              <ChevronLeft className="h-4 w-4 sm:h-3 sm:w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8">
              <ChevronRight className="h-4 w-4 sm:h-3 sm:w-3" />
            </Button>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-45 h-9 sm:h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last_24_hours">Last 24 hours</SelectItem>
              <SelectItem value="this_week">This week</SelectItem>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="this_month">This month</SelectItem>
              <SelectItem value="last_30_days">Last 30 days</SelectItem>
              <SelectItem value="last_90_days">Last 90 days</SelectItem>
              <SelectItem value="this_year">This year</SelectItem>
              <SelectItem value="last_6_months">Last 6 months</SelectItem>
              <SelectItem value="last_12_months">Last 12 months</SelectItem>
              <SelectItem value="all_time">All time</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics */}
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-2 mb-6">
          {!analytics && isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-28 lg:h-24 w-full rounded-xl" />
            ))
          ) : (
            <>
              <MetricCard
                title="Visitors"
                value={analytics?.metrics?.visitors.toLocaleString() || "0"}
                change={0}
              />
              <MetricCard
                title="Visits"
                value={analytics?.metrics?.visits.toLocaleString() || "0"}
                change={0}
              />
              <MetricCard
                title="Views"
                value={analytics?.metrics?.views.toLocaleString() || "0"}
                change={0}
              />
              <MetricCard
                title="Bounce rate"
                value={`${Number(analytics?.metrics?.bounceRate || 0).toFixed(0)}%`}
                change={0}
                isNegative
              />
              <MetricCard
                title="Visit duration"
                value={`${Number(analytics?.metrics?.duration || 0).toFixed(0)}s`}
                change={0}
              />
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {!analytics && isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : (
          <ChartAreaInteractive data={analytics?.chart} />
        )}
      </div>

      <div className="space-y-6 min-h-screen pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {!analytics && isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
            ))
          ) : (
            <>
              <DataTable
                title="Pages"
                tabs={["Path", "Entry", "Exit"]}
                data={{
                  Path: analytics?.tables.pages || [],
                  Entry: [],
                  Exit: [],
                }}
                type="path"
              />
              <DataTable
                title="Sources"
                tabs={["Referrers", "Channels"]}
                data={{
                  Referrers: analytics?.tables.sources || [],
                  Channels: [],
                }}
                type="source"
              />
              <DataTable
                title="Environment"
                tabs={["Browsers", "OS", "Devices"]}
                data={{
                  Browsers: analytics?.tables.browsers || [],
                  OS: analytics?.tables.os || [],
                  Devices: analytics?.tables.devices || [],
                }}
                type="browser"
              />
              <DataTable
                title="Location"
                tabs={["Countries", "Regions", "Cities"]}
                data={{
                  Countries: analytics?.tables.countries || [],
                  Regions: analytics?.tables.regions || [],
                  Cities: analytics?.tables.cities || [],
                }}
                type="country"
              />
            </>
          )}
        </div>
        {!analytics && isLoading ? (
          <Skeleton className="h-[400px] w-full rounded-xl" />
        ) : (
          <DataMap
            mapData={analytics?.map || []}
            trafficData={analytics?.traffic || []}
          />
        )}
      </div>
    </div>
  );
}
