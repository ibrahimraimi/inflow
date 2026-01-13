"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { LinkType } from "@/configs/types";

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
