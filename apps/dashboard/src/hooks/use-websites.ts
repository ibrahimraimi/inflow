"use client";

import useSWR from "swr";
import { fetcherWithParams } from "@inflow/core/lib/fetcher";
import type { WebsiteWithAnalytics } from "@inflow/types";

export function useWebsites(range = "today", from?: string, to?: string) {
  const { data, error, isLoading, mutate } = useSWR<WebsiteWithAnalytics[]>(
    [`/api/website`, { range, from, to, websiteOnly: "false" }],
    fetcherWithParams
  );

  return {
    websites: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
