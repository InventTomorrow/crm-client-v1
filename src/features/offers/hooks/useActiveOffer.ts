"use client";
import { useQuery } from "@tanstack/react-query";
import { getActiveOffer } from "../services/offerService";

export const offerKeys = {
  active: ["offers", "active"] as const,
};

/**
 * The live campaign, or null. Refetched on focus so a tab left open overnight
 * stops advertising a campaign that has since ended.
 */
export function useActiveOffer() {
  return useQuery({
    queryKey: offerKeys.active,
    queryFn: getActiveOffer,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
