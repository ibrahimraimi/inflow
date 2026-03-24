"use client";

import useSWR from "swr";
import { fetcherWithParams } from "@inflow/core/lib/fetcher";
import type { AnalyticsData } from "@inflow/types";

export function useGlobalAnalytics(range = "last_7_days", from?: string, to?: string) {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AnalyticsData>(
      [`/api/analytics`, { range, from, to }],
      fetcherWithParams,
      { keepPreviousData: true }
    );

  return {
    analytics: data,
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}
