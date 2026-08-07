import { apiClient } from "@/lib/apiClient";
import type {
  PublicSubscriptionLink,
  SubmitSubscriptionPayload,
  SubmitSubscriptionResult,
} from "./types";

// Every call here is PUBLIC (no session) — the token in the URL is the only
// credential, so nothing tenant-scoped may be requested from this module.

export async function getPublicSubscriptionLink(token: string) {
  const res = await apiClient.get<{ success: true; data: PublicSubscriptionLink }>(
    `/subscribe/${token}`,
  );
  return res.data.data;
}

/**
 * Multipart upload straight to the public receipt endpoint — deliberately NOT
 * usePresignedUpload, which posts to the authenticated /upload/presign.
 */
export async function uploadSubscriptionReceipt(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<{ success: true; data: { receiptUrl: string } }>(
    `/subscribe/${token}/receipt`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data.receiptUrl;
}

export async function submitSubscription(
  token: string,
  payload: SubmitSubscriptionPayload,
) {
  const res = await apiClient.post<{ success: true; data: SubmitSubscriptionResult }>(
    `/subscribe/${token}/submit`,
    payload,
  );
  return res.data.data;
}
