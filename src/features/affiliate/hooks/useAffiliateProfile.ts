"use client";
import { useQuery } from "@tanstack/react-query";
import { getAffiliateProfile } from "../services/affiliateService";

// Long stale time: it also decides whether the profile menu shows the affiliate link.
export function useAffiliateProfile() {
  return useQuery({
    queryKey: ["affiliate", "profile"],
    queryFn: getAffiliateProfile,
    staleTime: 10 * 60 * 1000,
  });
}
