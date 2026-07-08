import { apiClient } from "@/lib/apiClient";
import type {
  CheckoutContactPatch,
  PublicCheckout,
  ReceiptChannels,
  ReceiptResult,
} from "./types";

// ── Authenticated (dashboard) ──────────────────────────────

/** Creates (or reuses) a shareable checkout link for an existing order. */
export async function generateCheckoutLink(orderId: string) {
  const res = await apiClient.post<{
    success: true;
    data: { checkoutUrl: string; token: string };
  }>(`/orders/${orderId}/checkout-link`);
  return res.data.data;
}

/** Sends an order receipt over the selected channels. */
export async function sendOrderReceipt(
  orderId: string,
  channels: ReceiptChannels,
) {
  const res = await apiClient.post<{ success: true; data: ReceiptResult }>(
    `/orders/${orderId}/receipt`,
    { channels },
  );
  return res.data.data;
}

// ── Public (hosted checkout page, no auth) ─────────────────

export async function getPublicCheckout(token: string) {
  const res = await apiClient.get<{ success: true; data: PublicCheckout }>(
    `/checkout/${token}`,
  );
  return res.data.data;
}

export async function confirmPublicCheckout(
  token: string,
  patch: CheckoutContactPatch,
) {
  const res = await apiClient.post<{ success: true; data: PublicCheckout }>(
    `/checkout/${token}/confirm`,
    patch,
  );
  return res.data.data;
}
