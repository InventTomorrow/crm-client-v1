"use client";
import { AFFILIATE_HOME } from "@/features/auth/utils/authLanding";
import { extractErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { acceptAffiliateInvite, previewAffiliateInvite } from "../services/affiliateJoinService";
import { buildAffiliateJoinSchema, type AffiliateJoinFormValues, type ValidAffiliateInvite } from "../types";

export function useAffiliateInvitePreview(token: string) {
  return useQuery({
    queryKey: ["affiliate", "invite-preview", token],
    queryFn: () => previewAffiliateInvite(token),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  });
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

/** Owns the join form: validation follows the link's method, success signs the person in. */
export function useAffiliateJoinForm(token: string, invite: ValidAffiliateInvite) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isSignup = invite.method === "SIGNUP";
  const resolver = useMemo(() => zodResolver(buildAffiliateJoinSchema(invite.method)), [invite.method]);

  const form = useForm<AffiliateJoinFormValues>({
    resolver,
    defaultValues: {
      ...splitFullName(invite.name),
      phone: invite.phone ?? "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: AffiliateJoinFormValues) =>
      acceptAffiliateInvite({
        token,
        password: values.password,
        acceptTerms: true,
        ...(isSignup
          ? {
              firstName: values.firstName,
              ...(values.lastName ? { lastName: values.lastName } : {}),
              ...(values.phone ? { phone: values.phone } : {}),
            }
          : {}),
      }),
    onSuccess: () => {
      // A previous session's cache in this browser must not leak into the new account.
      queryClient.clear();
      toast.success("Welcome to the affiliate programme");
      router.replace(AFFILIATE_HOME);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  return {
    form,
    isSignup,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
  };
}
