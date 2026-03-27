"use client";

import Link from "next/link";
import { useState } from "react";

import { PlusIcon, Search, SquarePen } from "lucide-react";

import { cn } from "@inflow/core/lib/utils";
import { Input } from "@inflow/ui";
import { Button } from "@inflow/ui";
import { Skeleton } from "@inflow/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@inflow/ui";

import { useWebsites } from "@/hooks/use-websites";
import { useGlobalAnalytics } from "@/hooks/use-global-analytics";
import { MetricCard } from "./(website)/_components/metric-card";
import dynamic from "next/dynamic";
const ChartAreaInteractive = dynamic(
  () => import("./(website)/_components/chart").then((mod) => mod.ChartAreaInteractive),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  }
);

import { authClient } from "@inflow/core/lib/auth-client";
import { isFeatureEnabled } from "@inflow/core/lib/feature-flags";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("last_7_days");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: session } = authClient.useSession();
  const showMultiSite = isFeatureEnabled("multiSiteDashboard", session?.user);

  const { websites: websiteList, isLoading: loadingWebsites } = useWebsites(
    showMultiSite ? dateRange : "today"
  );
  
  const { analytics, isLoading: analyticsLoading } = useGlobalAnalytics(dateRange);

  const filteredWebsites = websiteList.filter(
    (item) =>
      item.website.websiteName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!showMultiSite) {
    return (
      <div className="lg:mt-8 mt-10 w-full">
        <div className="flex items-center justify-between mb-8 border-b pb-6">
          <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
            Websites
          </h1>
          <div className="bg-foreground/10 rounded-[calc(var(--radius-lg)+0.125rem)] border p-0.5">
            <Link href="/dashboard/new">
              <Button
                size="default"
                className="rounded-lg px-4 text-sm font-medium cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-nowrap">Add website</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm border-dashed">
          <div className="p-6">
            <div className="relative max-w-sm mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/40 border-border/40 h-10 text-sm"
              />
            </div>

            <div className="w-full">
              <div className="hidden lg:flex items-center mb-4 px-2 text-xs font-bold text-muted-foreground tracking-wide uppercase">
                <div className="w-1/2 max-w-75">Name</div>
                <div className="flex-1">Domain</div>
                <div className="flex-1">Page View (last 24h)</div>
                <div className="flex justify-end">Actions</div>
              </div>

              <div className="divide-y divide-border/40 lg:border-t border-border/40">
                {loadingWebsites ? (
                  // biome-ignore lint/complexity/noUselessFragments: false positive
                  <>
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-2 lg:py-4 border rounded-lg lg:border-0 lg:rounded-none mb-4 lg:mb-0"
                      >
                        <div className="flex items-center justify-between lg:justify-start gap-3 lg:w-1/2 lg:max-w-75 mb-3 lg:mb-0">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-8 lg:size-6 rounded" />
                            <Skeleton className="h-4 w-32 lg:w-24" />
                          </div>
                          <Skeleton className="h-3 w-10 lg:hidden" />
                        </div>
                        <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                          <Skeleton className="h-3 w-12 lg:hidden" />
                          <Skeleton className="h-4 w-48 lg:w-32" />
                        </div>
                        <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                          <Skeleton className="h-3 w-16 lg:hidden" />
                          <Skeleton className="h-4 w-24 lg:w-16" />
                        </div>
                        <div className="flex items-center justify-center lg:justify-end border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                          <Skeleton className="h-9 w-full lg:h-8 lg:w-8 rounded" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  // biome-ignore lint/complexity/noUselessFragments: false positive
                  <>
                    {filteredWebsites.map(({ website: site, analytics }) => (
                      <div
                        key={site.id}
                        className="group relative flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-2 lg:py-4 hover:bg-muted/30 transition-colors cursor-pointer border rounded-lg lg:border-0 lg:rounded-none mb-4 lg:mb-0"
                      >
                        <Link
                          href={`/dashboard/${site.websiteId}`}
                          className="flex items-center justify-between lg:justify-start gap-3 lg:w-1/2 lg:max-w-75 mb-3 lg:mb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "size-8 lg:size-6 rounded flex items-center justify-center text-xs lg:text-[10px] font-bold shadow-sm bg-primary/10 text-primary"
                              )}
                            >
                              {site.websiteName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold lg:font-medium text-base lg:text-sm text-foreground underline-offset-4 decoration-muted lg:group-hover:underline">
                              {site.websiteName}
                            </span>
                          </div>
                          <div className="lg:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Name
                          </div>
                        </Link>

                        <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                          <div className="lg:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Domain
                          </div>
                          <div className="text-muted-foreground text-sm font-medium lg:font-normal">
                            {site.domain.replace("https://", "")}
                          </div>
                        </div>

                        <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                          <div className="lg:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Views (24h)
                          </div>
                          <div className="text-muted-foreground text-sm font-mono">
                            {analytics?.last24hVisitors || 0}
                          </div>
                        </div>

                        <div className="flex items-center justify-center lg:justify-end border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                          <Link
                            href={`/dashboard/${site.websiteId}/edit`}
                            className="w-full lg:w-auto"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-full lg:h-8 lg:w-8 text-muted-foreground opacity-100 lg:opacity-70 lg:hover:opacity-100 lg:hover:text-foreground lg:hover:bg-muted cursor-pointer flex items-center justify-center gap-2 lg:block"
                            >
                              <SquarePen className="w-4 h-4" />
                              <span className="lg:hidden text-sm font-medium">
                                Edit Website
                              </span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // MULTI-SITE VIEW (Feature Toggled)
  // -----------------------------------------------------
  return (
    <div className="lg:mt-8 mt-10 w-full mb-20 whitespace-normal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Portfolio Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-45 h-9 sm:h-10 text-sm">
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
            </SelectContent>
          </Select>

          <div className="bg-foreground/10 rounded-[calc(var(--radius-lg)+0.125rem)] border p-0.5 shrink-0">
            <Link href="/dashboard/new">
              <Button
                size="default"
                className="rounded-lg px-4 text-sm font-medium cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline-block text-nowrap">Add website</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="relative mb-8">
        <h2 className="text-lg font-semibold mb-4">Overall Performance</h2>
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
                title="Total Visitors"
                value={analytics?.metrics?.visitors.toLocaleString() || "0"}
                change={0}
              />
              <MetricCard
                title="Total Visits"
                value={analytics?.metrics?.visits.toLocaleString() || "0"}
                change={0}
              />
              <MetricCard
                title="Total Views"
                value={analytics?.metrics?.views.toLocaleString() || "0"}
                change={0}
              />
              <MetricCard
                title="Avg Bounce Rate"
                value={`${Number(analytics?.metrics?.bounceRate || 0).toFixed(0)}%`}
                change={0}
                isNegative
              />
              <MetricCard
                title="Avg Visit Duration"
                value={`${Number(analytics?.metrics?.duration || 0).toFixed(0)}s`}
                change={0}
              />
            </>
          )}
        </div>
        
        <div className="space-y-6">
          {!analytics && analyticsLoading ? (
            <Skeleton className="h-[300px] w-full rounded-xl" />
          ) : (
            <ChartAreaInteractive data={analytics?.chart} />
          )}
        </div>
      </div>

      <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm border-dashed mt-12">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold">Your Websites</h2>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/40 border-border/40 h-10 text-sm w-full"
              />
            </div>
          </div>

          <div className="w-full">
            <div className="hidden lg:flex items-center mb-4 px-2 text-xs font-bold text-muted-foreground tracking-wide uppercase">
              <div className="w-1/2 max-w-75">Name</div>
              <div className="flex-1">Domain</div>
              <div className="flex-1">Visitors</div>
              <div className="flex justify-end">Actions</div>
            </div>

            <div className="divide-y divide-border/40 lg:border-t border-border/40">
              {loadingWebsites ? (
                // biome-ignore lint/complexity/noUselessFragments: false positive
                <>
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-2 lg:py-4 border rounded-lg lg:border-0 lg:rounded-none mb-4 lg:mb-0"
                    >
                      <div className="flex items-center justify-between lg:justify-start gap-3 lg:w-1/2 lg:max-w-75 mb-3 lg:mb-0">
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-8 lg:size-6 rounded" />
                          <Skeleton className="h-4 w-32 lg:w-24" />
                        </div>
                        <Skeleton className="h-3 w-10 lg:hidden" />
                      </div>
                      <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                        <Skeleton className="h-3 w-12 lg:hidden" />
                        <Skeleton className="h-4 w-48 lg:w-32" />
                      </div>
                      <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                        <Skeleton className="h-3 w-16 lg:hidden" />
                        <Skeleton className="h-4 w-24 lg:w-16" />
                      </div>
                      <div className="flex items-center justify-center lg:justify-end border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                        <Skeleton className="h-9 w-full lg:h-8 lg:w-8 rounded" />
                      </div>
                    </div>
                  ))}
                </>
              ) : filteredWebsites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No websites found. Let's add one!
                </div>
              ) : (
                // biome-ignore lint/complexity/noUselessFragments: false positive
                <>
                  {filteredWebsites.map(({ website: site, analytics: siteAnalytics }) => (
                    <div
                      key={site.id}
                      className="group relative flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-2 lg:py-4 hover:bg-muted/30 transition-colors cursor-pointer border rounded-lg lg:border-0 lg:rounded-none mb-4 lg:mb-0"
                    >
                      <Link
                        href={`/dashboard/${site.websiteId}`}
                        className="flex items-center justify-between lg:justify-start gap-3 lg:w-1/2 lg:max-w-75 mb-3 lg:mb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-8 lg:size-6 rounded flex items-center justify-center text-xs lg:text-[10px] font-bold shadow-sm bg-primary/10 text-primary"
                            )}
                          >
                            {site.websiteName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold lg:font-medium text-base lg:text-sm text-foreground underline-offset-4 decoration-muted lg:group-hover:underline">
                            {site.websiteName}
                          </span>
                        </div>
                        <div className="lg:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Name
                        </div>
                      </Link>

                      <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                        <div className="lg:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Domain
                        </div>
                        <div className="text-muted-foreground text-sm font-medium lg:font-normal">
                          {site.domain.replace("https://", "")}
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:flex-1 mb-3 lg:mb-0 border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                        <div className="lg:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Visitors
                        </div>
                        <div className="text-muted-foreground text-sm font-mono">
                          {siteAnalytics?.totalVisitors || 0}
                        </div>
                      </div>

                      <div className="flex items-center justify-center lg:justify-end border-t border-dashed lg:border-0 pt-3 lg:pt-0">
                        <Link
                          href={`/dashboard/${site.websiteId}/edit`}
                          className="w-full lg:w-auto"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-full lg:h-8 lg:w-8 text-muted-foreground opacity-100 lg:opacity-70 lg:hover:opacity-100 lg:hover:text-foreground lg:hover:bg-muted cursor-pointer flex items-center justify-center gap-2 lg:block"
                          >
                            <SquarePen className="w-4 h-4" />
                            <span className="lg:hidden text-sm font-medium">
                              Edit Website
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
