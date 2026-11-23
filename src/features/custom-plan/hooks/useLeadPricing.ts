"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeadPricing } from "../services/customPlanService";

export function useLeadPricing({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["lead-pricing"],
    queryFn: getLeadPricing,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
