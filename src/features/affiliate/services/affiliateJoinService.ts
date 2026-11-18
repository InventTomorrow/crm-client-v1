import type { LoginResponse } from "@/features/auth/types";
import { apiClient } from "@/lib/apiClient";
import type { AffiliateInvitePreview } from "../types";

export interface AcceptAffiliateInvitePayload {
  token: string;
  password: string;
  acceptTerms: true;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function previewAffiliateInvite(token: string): Promise<AffiliateInvitePreview> {
  const res = await apiClient.get<{ success: true; data: AffiliateInvitePreview }>("/auth/affiliate-join", {
    params: { token },
  });
  return res.data.data;
}

/** Creates the account and signs it in (the server sets the session cookies). */
export async function acceptAffiliateInvite(payload: AcceptAffiliateInvitePayload): Promise<LoginResponse> {
  const res = await apiClient.post<{ success: true; data: LoginResponse }>("/auth/affiliate-join", payload);
  return res.data.data;
}
