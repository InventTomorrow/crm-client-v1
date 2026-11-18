import { apiClient } from "@/lib/apiClient";
import type {
  AffiliateAnalytics,
  AffiliateShareCode,
  AffiliateProfile,
  AffiliateReferralsPage,
  AffiliateReferredCustomer,
} from "../types";

/** Null when the signed-in user is not in the affiliate programme. */
export async function getAffiliateProfile(): Promise<AffiliateProfile | null> {
  const res = await apiClient.get<{ success: true; data: AffiliateProfile | null }>("/affiliate/me");
  return res.data.data;
}

export async function getAffiliateAnalytics(range: {
  from: string;
  to: string;
}): Promise<AffiliateAnalytics> {
  const res = await apiClient.get<{ success: true; data: AffiliateAnalytics }>(
    "/affiliate/me/analytics",
    { params: range },
  );
  return res.data.data;
}

export async function listAffiliateReferrals(params: {
  page: number;
  limit: number;
}): Promise<AffiliateReferralsPage> {
  const res = await apiClient.get<{
    success: true;
    data: AffiliateReferredCustomer[];
    meta: AffiliateReferralsPage["meta"];
  }>("/affiliate/me/referrals", { params });
  return { items: res.data.data, meta: res.data.meta };
}

export async function createOwnReferralCode(input: { code?: string; discountPercent: number }): Promise<AffiliateShareCode> {
  const res = await apiClient.post<{ success: true; data: AffiliateShareCode }>("/affiliate/me/codes", input);
  return res.data.data;
}
