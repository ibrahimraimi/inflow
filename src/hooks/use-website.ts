"use client";

import useSWR from "swr";
import type { WebsiteType } from "@/configs/types";
import { fetcher } from "@/lib/fetcher";

export function useWebsite(id: string) {
  const { data, error, isLoading, mutate } = useSWR<WebsiteType>(
    id ? `/api/website/${id}` : null,
    fetcher
  );

  return {
    website: data,
    isLoading,
    isError: error,
    mutate,
  };
}
