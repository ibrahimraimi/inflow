"use client";

import useSWR from "swr";
import { fetcherWithParams } from "@/lib/fetcher";

export interface RageClickItem {
  element: string;
  text: string;
  url: string;
  clicks: number;
  uniqueUsers: number;
}

export function useRageClicks(websiteId: string, range = "today") {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<RageClickItem[]>(
      websiteId ? [`/api/website/${websiteId}/rage-clicks`, { range }] : null,
      fetcherWithParams,
      { keepPreviousData: true }
    );

  return {
    rageClicks: data,
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}
