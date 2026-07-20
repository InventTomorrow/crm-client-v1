"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import {
  confirmPublicCheckout,
  generateCheckoutLink,
  getPublicCheckout,
  sendOrderReceipt,
} from "./service";
import type { CheckoutContactPatch, ReceiptChannels } from "./types";

/** Dashboard: generate a shareable checkout link for an order. */
export function useGenerateCheckout() {
  return useMutation({
    mutationFn: (orderId: string) => generateCheckoutLink(orderId),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/** Dashboard: send an order receipt over WhatsApp / email. */
export function useSendReceipt() {
  return useMutation({
    mutationFn: ({
      orderId,
      channels,
    }: {
      orderId: string;
      channels: ReceiptChannels;
    }) => sendOrderReceipt(orderId, channels),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/** Public checkout page: load an order by its token. */
export function usePublicCheckout(token: string) {
  return useQuery({
    queryKey: ["checkout", token],
    queryFn: () => getPublicCheckout(token),
    enabled: !!token,
    retry: false,
  });
}

/** Public checkout page: confirm & place the order. */
export function useConfirmCheckout(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: CheckoutContactPatch) =>
      confirmPublicCheckout(token, patch),
    onSuccess: (data) => qc.setQueryData(["checkout", token], data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
