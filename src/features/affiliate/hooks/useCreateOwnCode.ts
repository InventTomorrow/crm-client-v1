"use client";
import { extractErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOwnReferralCode } from "../services/affiliateService";
import { buildOwnCodeSchema, type AffiliateProfile, type OwnCodeFormValues } from "../types";

const PROFILE_QUERY_KEY = ["affiliate", "profile"];

/** Form for a code the affiliate makes; the discount is capped at what the admin allowed. */
export function useCreateOwnCodeForm(maxDiscountPercent: number, onCreated: () => void) {
  const queryClient = useQueryClient();
  const resolver = useMemo(() => zodResolver(buildOwnCodeSchema(maxDiscountPercent)), [maxDiscountPercent]);

  const form = useForm<OwnCodeFormValues>({
    resolver,
    defaultValues: { code: "", discountPercent: maxDiscountPercent },
  });

  // Not optimistic on purpose: a taken code name must keep the dialog open with the typed value.
  const mutation = useMutation({
    mutationFn: (values: OwnCodeFormValues) =>
      createOwnReferralCode({
        discountPercent: values.discountPercent,
        ...(values.code ? { code: values.code.toUpperCase() } : {}),
      }),
    onSuccess: (createdCode) => {
      queryClient.setQueryData<AffiliateProfile | null>(PROFILE_QUERY_KEY, (profile) =>
        profile ? { ...profile, codes: [...profile.codes, createdCode] } : profile,
      );
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success(`Code ${createdCode.code} is ready to share`);
      form.reset({ code: "", discountPercent: maxDiscountPercent });
      onCreated();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  return {
    form,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
  };
}
