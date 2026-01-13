"use client";

import useSWR from "swr";
import { fetcherWithParams } from "@/lib/fetcher";

import type { AnalyticsData } from "@/configs/types";

export function useAnalytics(websiteId: string, range = "today") {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    websiteId ? [`/api/website/${websiteId}/analytics`, { range }] : null,
    fetcherWithParams
  );

  return {
    analytics: data,
    isLoading,
    isError: error,
    mutate,
  };
}
