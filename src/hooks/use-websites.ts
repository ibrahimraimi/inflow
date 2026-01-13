"use client";

import useSWR from "swr";
import { format } from "date-fns-tz";
import type { WebsiteWithAnalytics } from "@/configs/types";
import { fetcherWithParams } from "@/lib/fetcher";

export function useWebsites() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error, isLoading, mutate } = useSWR<WebsiteWithAnalytics[]>(
    [`/api/website?from=${today}&to=${today}`, { websiteOnly: "false" }],
    fetcherWithParams
  );

  return {
    websites: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
