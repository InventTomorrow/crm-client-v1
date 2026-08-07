"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useSupportContact } from "../hooks/useBilling";
import type { Plan } from "../types";
import { formatPlanPeriod, formatPlanPrice } from "../utils/planFormat";

interface RequestPlanDialogProps {
  plan: Plan | null;
  open: boolean;
  onClose: () => void;
}

export function RequestPlanDialog({
  plan,
  open,
  onClose,
}: RequestPlanDialogProps) {
  const { data: contact, isLoading } = useSupportContact();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request {plan?.name ?? "this plan"}</DialogTitle>
          <DialogDescription>
            {plan && (
              <>
                {formatPlanPrice(plan)}{" "}
                {formatPlanPeriod(plan.duration, plan.customDurationDays)} —
                contact us to get set up. We&apos;ll send a secure payment link
                or confirm your transfer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-[13px] text-[var(--ink-soft)]">
            Loading contact details…
          </div>
        ) : (
          <div className="space-y-3 text-[13px]">
            {contact?.supportName && (
              <div className="font-medium">{contact.supportName}</div>
            )}
            {contact?.supportPhone && (
              <a
                href={`tel:${contact.supportPhone}`}
                className="flex items-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <Phone size={14} /> {contact.supportPhone}
              </a>
            )}
            {contact?.supportWhatsapp && (
              <a
                href={`https://wa.me/${contact.supportWhatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
            {contact?.supportEmail && (
              <a
                href={`mailto:${contact.supportEmail}`}
                className="flex items-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <Mail size={14} /> {contact.supportEmail}
              </a>
            )}
            {contact?.paymentInstructions && (
              <div className="rounded-lg bg-[var(--surface-2)] p-3 text-[12px] text-[var(--ink-soft)] whitespace-pre-line">
                {contact.paymentInstructions}
              </div>
            )}
            {!contact?.supportPhone &&
              !contact?.supportWhatsapp &&
              !contact?.supportEmail && (
                <div className="text-[var(--ink-soft)]">
                  Contact details will be shared with you shortly.
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
