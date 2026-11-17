"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listAffiliateReferrals } from "../services/affiliateService";

const REFERRALS_PAGE_SIZE = 10;

export function useAffiliateReferrals(isEnabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["affiliate", "referrals"],
    queryFn: ({ pageParam }) =>
      listAffiliateReferrals({ page: pageParam, limit: REFERRALS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page * lastPage.meta.limit < lastPage.meta.total
        ? lastPage.meta.page + 1
        : undefined,
    enabled: isEnabled,
  });
}
