"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Share2,
  SlidersHorizontal,
  SquarePen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { WebsiteType } from "@/configs/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "../_components/metric-card";
import { ChartAreaInteractive } from "../_components/chart";
import { DataTable } from "../_components/data-table";
import { DataMap } from "../_components/data-map";
import { useWebsite } from "@/hooks/use-website";
import { useAnalytics } from "@/hooks/use-analytics";
import type { AnalyticsData } from "@/configs/types";

export default function WebsiteDetailPage() {
  const params = useParams();
  const websiteId = params.id as string;

  const [dateRange, setDateRange] = useState("today");
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    website,
    isLoading: websiteLoading,
    isError: websiteError,
  } = useWebsite(websiteId);
  const {
    analytics,
    isLoading: analyticsLoading,
    isValidating: analyticsValidating,
    isError: analyticsError,
  } = useAnalytics(websiteId, dateRange);

  if (websiteLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="lg:mt-8 mt-20 w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Website not found</p>
          <Link href="/dashboard">
            <Button variant="link" className="mt-4">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:mt-8 mt-20">
      <div className="mb-8 border-b pb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Websites</span>
        </Link>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-10 rounded flex items-center justify-center text-[10px] font-bold shadow-sm bg-primary/10 text-primary"
              )}
            >
              <span className="text-2xl">
                {website.websiteName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{website.websiteName}</h1>
              <p className="text-sm text-muted-foreground">{website.domain}</p>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <Link href={`/dashboard/${websiteId}/edit`}>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            </Link>
            <Link href={`/dashboard/${websiteId}/edit`}>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <SquarePen className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterOpen(true)}
          className="cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1.5" />
          Filter
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="">
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="">
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-45">
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
        {analyticsValidating && (
          <div className="absolute -top-6 right-0 flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating...
          </div>
        )}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {!analytics && analyticsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
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
        {!analytics && analyticsLoading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : (
          <ChartAreaInteractive data={analytics?.chart} />
        )}
      </div>

      <div className="space-y-6 min-h-screen pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {!analytics && analyticsLoading ? (
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
        {!analytics && analyticsLoading ? (
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
