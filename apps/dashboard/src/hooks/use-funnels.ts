import useSWR from "swr";
import { fetcher } from "@inflow/core/lib/fetcher";
import type { FunnelStep, FunnelEvaluationResult } from "@inflow/types";

export type FunnelData = {
  id: string;
  name: string;
  websiteId: string;
  steps: FunnelStep[];
  createdAt: string;
  updatedAt: string;
};

type CreateFunnelPayload = {
  name: string;
  steps: FunnelStep[];
};

type FunnelEvaluationResponse = {
  funnel: {
    id: string;
    name: string;
  };
  evaluation: FunnelEvaluationResult[];
};

export function useFunnels(websiteId: string) {
  const { data, error, isLoading, mutate } = useSWR<FunnelData[]>(
    websiteId ? `/api/website/${websiteId}/funnels` : null,
    fetcher
  );

  const createFunnel = async (funnelData: CreateFunnelPayload) => {
    try {
      const res = await fetch(`/api/website/${websiteId}/funnels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(funnelData),
      });

      if (!res.ok) throw new Error("Failed to create funnel");

      const newFunnel = await res.json();
      mutate();
      return newFunnel;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    try {
      const res = await fetch(`/api/website/${websiteId}/funnels/${funnelId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete funnel");
      mutate();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return {
    funnels: data,
    isLoading,
    isError: error,
    createFunnel,
    deleteFunnel,
    mutate,
  };
}

export function useFunnel(websiteId: string, funnelId: string, from?: string, to?: string) {
  const queryParams = new URLSearchParams();
  if (from) queryParams.append("from", from);
  if (to) queryParams.append("to", to);
  
  const queryString = queryParams.toString();
  const endpoint = websiteId && funnelId 
    ? `/api/website/${websiteId}/funnels/${funnelId}/evaluate${queryString ? `?${queryString}` : ''}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<FunnelEvaluationResponse>(endpoint, fetcher);

  return {
    funnel: data?.funnel,
    evaluation: data?.evaluation,
    isLoading,
    isError: error,
    mutate,
  };
}
