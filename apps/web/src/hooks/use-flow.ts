"use client";

import useSWR from "swr";
import { fetcherWithParams } from "@inflow/core/lib/fetcher";

import type { FlowData } from "@inflow/types";

export function useFlow(websiteId: string, range = "last_7_days") {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<FlowData>(
      websiteId ? [`/api/website/${websiteId}/flow`, { range }] : null,
      fetcherWithParams,
      { keepPreviousData: true }
    );

  return {
    flow: data,
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}
