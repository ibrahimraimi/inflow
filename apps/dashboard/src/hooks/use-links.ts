"use client";

import useSWR from "swr";
import { fetcher } from "@inflow/core/lib/fetcher";
import type { LinkType } from "@inflow/types";

export function useLinks() {
  const { data, error, isLoading, mutate } = useSWR<LinkType[]>(
    "/api/links",
    fetcher
  );

  return {
    links: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
