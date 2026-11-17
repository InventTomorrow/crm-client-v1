"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateWorkspace } from "@/features/auth/hooks/useAuth";
import { createWorkspaceSchema, type CreateWorkspaceData } from "@/features/auth/types";
import { useReferralCodeCheck } from "@/features/referrals/hooks/useReferralCodeCheck";
import {
  clearPendingReferralCode,
  readPendingReferralCode,
} from "@/features/referrals/utils/pendingReferralCode";

/** Workspace step form, including the optional referral code captured from a share link. */
export function useWorkspaceForm() {
  const createWorkspaceMutation = useCreateWorkspace();
  const [isReferralFieldRequested, setIsReferralFieldRequested] = useState(false);

  const form = useForm<CreateWorkspaceData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", businessName: "", referralCode: "" },
  });
  const referralCode = useWatch({ control: form.control, name: "referralCode" });
  const referralCheck = useReferralCodeCheck(referralCode ?? "");
  const isReferralFieldOpen = isReferralFieldRequested || Boolean(referralCode);

  useEffect(() => {
    const pendingReferralCode = readPendingReferralCode();
    if (pendingReferralCode) form.setValue("referralCode", pendingReferralCode);
  }, [form]);

  const submitWorkspace = form.handleSubmit((values) => {
    const referralCode = values.referralCode?.trim().toUpperCase();
    // The server re-validates; this only stops a submit with a code we already know is bad.
    if (referralCode && referralCheck.status !== "valid") {
      form.setError("referralCode", {
        message:
          referralCheck.status === "invalid"
            ? referralCheck.message
            : "Wait for the code check to finish, or clear the field.",
      });
      return;
    }
    createWorkspaceMutation.mutate(
      {
        name: values.name,
        businessName: values.businessName,
        ...(referralCode ? { referralCode } : {}),
      },
      { onSuccess: clearPendingReferralCode },
    );
  });

  return {
    form,
    submitWorkspace,
    isPending: createWorkspaceMutation.isPending,
    error: createWorkspaceMutation.error,
    referralCheck,
    isReferralFieldOpen,
    openReferralField: () => setIsReferralFieldRequested(true),
  };
}
