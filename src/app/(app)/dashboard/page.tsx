"use client";

import Link from "next/link";
import { useState } from "react";

import { PlusIcon, Search, SquarePen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsites } from "@/hooks/use-websites";

export default function DashboardPage() {
  const { websites: websiteList, isLoading: loading, isError } = useWebsites();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredWebsites = websiteList.filter(
    (item) =>
      item.website.websiteName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {loading ? (
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
