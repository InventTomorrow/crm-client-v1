"use client";
import { extractErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitAffiliateApplication } from "../services/affiliateApplicationService";
import { affiliateApplicationSchema, type AffiliateApplicationInput } from "../types";

/** Public "become an affiliate" form. The component only renders. */
export function useAffiliateApplicationForm() {
  const form = useForm<AffiliateApplicationInput>({
    resolver: zodResolver(affiliateApplicationSchema),
    defaultValues: { name: "", email: "", phone: "", website: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: submitAffiliateApplication,
    onSuccess: () => form.reset(),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  return {
    form,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    isSubmitted: mutation.isSuccess,
  };
}
