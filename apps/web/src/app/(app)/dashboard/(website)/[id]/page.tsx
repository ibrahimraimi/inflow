"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Target,
  FunnelIcon,
  Loader2,
  SlidersHorizontal,
  SquarePen,
  Activity,
} from "lucide-react";

import { cn } from "@inflow/core/lib/utils";
import { Button } from "@/components/ui/button";
import type { WebsiteType } from "@inflow/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "../_components/metric-card";
import dynamic from "next/dynamic";
const ChartAreaInteractive = dynamic(
  () => import("../_components/chart").then((mod) => mod.ChartAreaInteractive),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  }
);
const DataTable = dynamic(
  () => import("../_components/data-table").then((mod) => mod.DataTable),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  }
);
const DataMap = dynamic(
  () => import("../_components/data-map").then((mod) => mod.DataMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
  }
);
import { useWebsite } from "@/hooks/use-website";
import { useAnalytics } from "@/hooks/use-analytics";
import { useRageClicks } from "@/hooks/use-rage-clicks";
import type { AnalyticsData } from "@inflow/types";
import { RenderIf } from "@inflow/core/lib/render-if";
import { RageClicksTable } from "../_components/rage-clicks-table";
import { authClient } from "@inflow/core/lib/auth-client";
import { isFeatureEnabled } from "@inflow/core/lib/feature-flags";

export default function WebsiteDetailPage() {
  const params = useParams();
  const websiteId = params.id as string;

  const { data: session } = authClient.useSession();
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

  const { rageClicks, isLoading: rageClicksLoading } = useRageClicks(websiteId, dateRange);

  if (websiteLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="lg:mt-8 mt-10 w-full">
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
    <div className="lg:mt-8 mt-10">
      <div className="mb-8 border-b pb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Websites</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-12 sm:size-10 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm bg-primary/10 text-primary border border-primary/20",
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
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/dashboard/${websiteId}/edit`}
              className="flex-1 sm:flex-none"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto cursor-pointer h-9 sm:h-8"
              >
                <SquarePen className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <RenderIf condition={false}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterOpen(true)}
              className="cursor-pointer h-9 sm:h-8 w-full sm:w-auto justify-start sm:justify-center"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-2 sm:mr-1.5" />
              Filter
            </Button>
          </RenderIf>

          <Link
            href={`/dashboard/${websiteId}/funnels`}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer h-9 sm:h-8 w-full sm:w-auto justify-start sm:justify-center"
            >
              <FunnelIcon className="h-3.5 w-3.5 mr-2 sm:mr-1.5" />
              Funnels
            </Button>
          </Link>
          <Link
            href={`/dashboard/${websiteId}/campaigns`}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer h-9 sm:h-8 w-full sm:w-auto justify-start sm:justify-center"
            >
              <Target className="h-3.5 w-3.5 mr-2 sm:mr-1.5" />
              Campaigns
            </Button>
          </Link>
          {isFeatureEnabled("flow", session?.user) && (
            <Link
              href={`/dashboard/${websiteId}/flow`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer h-9 sm:h-8 w-full sm:w-auto justify-start sm:justify-center"
              >
                <Activity className="h-3.5 w-3.5 mr-2 sm:mr-1.5" />
                Flow
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {analyticsValidating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse mr-2">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-8 sm:w-8"
            >
              <ChevronLeft className="h-4 w-4 sm:h-3 sm:w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-8 sm:w-8"
            >
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
          {!analytics && analyticsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 sm:h-28 lg:h-24 w-full rounded-xl"
              />
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
              <RageClicksTable data={rageClicks} isLoading={rageClicksLoading} />
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
