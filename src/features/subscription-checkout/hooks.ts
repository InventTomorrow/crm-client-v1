"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import {
  getPublicSubscriptionLink,
  submitSubscription,
  uploadSubscriptionReceipt,
} from "./service";
import type { SubmitSubscriptionPayload } from "./types";

/** Public checkout page: load the plan + prefill + support contact by token. */
export function usePublicSubscriptionLink(token: string) {
  return useQuery({
    queryKey: ["subscription-checkout", token],
    queryFn: () => getPublicSubscriptionLink(token),
    enabled: !!token,
    retry: false,
  });
}

/**
 * Receipt upload for the public page. Mirrors usePresignedUpload's shape
 * ({ upload, isPending }) so FileUpload can drive it, but posts multipart to
 * the unauthenticated /subscribe/:token/receipt endpoint instead.
 */
export function usePublicReceiptUpload(token: string) {
  const [progress, setProgress] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadSubscriptionReceipt(token, file),
    onMutate: () => setProgress(null),
    onError: (error) =>
      toast.error(`Receipt upload failed: ${extractErrorMessage(error)}`),
    onSettled: () => setProgress(null),
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    progress,
  };
}

export function useSubmitSubscription(token: string) {
  return useMutation({
    mutationFn: (payload: SubmitSubscriptionPayload) =>
      submitSubscription(token, payload),
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Could not submit your request")),
  });
}
