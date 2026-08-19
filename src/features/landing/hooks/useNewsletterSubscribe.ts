"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import { subscribeToNewsletter } from "../services/newsletterService";
import { newsletterSubscribeSchema, type NewsletterSubscribeInput } from "../types";

/** How long the thank-you note replaces the form before it comes back. */
const THANK_YOU_DURATION_MS = 6000;

/**
 * Footer newsletter form. Owns validation, submission and the success state —
 * the component only renders. Subscribing is idempotent server-side, so a
 * repeat address is a success, not an error.
 */
export function useNewsletterSubscribe() {
  const form = useForm<NewsletterSubscribeInput>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: () => form.reset(),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // The thank-you note is the confirmation, so it stands in for the form and
  // then hands it back — nobody is left staring at a dead end.
  const { isSuccess, reset } = mutation;
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(reset, THANK_YOU_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isSuccess, reset]);

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    isSubscribed: mutation.isSuccess,
    /** False when the address was already on the list — the note says so. */
    isNewSubscriber: mutation.data?.isNew ?? true,
  };
}
