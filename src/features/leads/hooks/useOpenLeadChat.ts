"use client";
import {
  checkWhatsAppNumber,
  type CheckNumberResult,
} from "@/features/channels/whatsapp/services/whatsapp.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function describeUnreachableNumber(result: CheckNumberResult): string {
  const phoneSuffix = result.phone ? ` (${result.phone})` : "";
  switch (result.reason) {
    case "NOT_ON_WHATSAPP":
      return `The phone number${phoneSuffix} for this lead is not registered on WhatsApp.`;
    case "NO_PHONE":
      return "This lead does not have a phone number specified.";
    case "INVALID_PHONE":
      return `The phone number${phoneSuffix} is invalid. Please ensure it includes country code.`;
    case "CHANNEL_DISCONNECTED":
      return "WhatsApp is not connected. Please connect WhatsApp first in Settings/Channels.";
    case "VERIFICATION_FAILED":
      return "Unable to verify this number on WhatsApp right now. Please try again.";
    default:
      return "The phone number for this lead could not be verified on WhatsApp.";
  }
}

/** Any record that points at a lead — a lead row, or an order carrying one. */
interface LeadReference {
  id: string;
}

/**
 * Verifies a lead's WhatsApp number here, before the inbox opens — the caller shows a
 * spinner on the clicked action, and the inbox trusts `verified=1` instead of re-checking.
 */
export function useOpenLeadChat() {
  const router = useRouter();
  const [verifyingLeadId, setVerifyingLeadId] = useState<string | null>(null);
  const [unreachableMessage, setUnreachableMessage] = useState<string | null>(
    null,
  );

  const openLeadChat = async (lead: LeadReference) => {
    if (verifyingLeadId) return;
    setVerifyingLeadId(lead.id);
    try {
      const result = await checkWhatsAppNumber({ leadId: lead.id });
      if (!result.exists) {
        setUnreachableMessage(describeUnreachableNumber(result));
        setVerifyingLeadId(null);
        return;
      }
      // Spinner stays on until navigation unmounts the page.
      router.push(`/inbox?lead=${lead.id}&verified=1`);
    } catch {
      toast.error("Failed to verify WhatsApp registration.");
      setVerifyingLeadId(null);
    }
  };

  return {
    openLeadChat,
    verifyingLeadId,
    unreachableMessage,
    dismissUnreachableMessage: () => setUnreachableMessage(null),
  };
}
