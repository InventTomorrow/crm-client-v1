import { apiClient } from "@/lib/apiClient";
import type { ReferralCodeCheck } from "../types";

export async function checkReferralCode(code: string): Promise<ReferralCodeCheck> {
  const res = await apiClient.get<{ success: true; data: ReferralCodeCheck }>(
    `/referral-codes/${encodeURIComponent(code)}`,
  );
  return res.data.data;
}
