"use client";
import { Mail, MessageCircle, Phone } from "lucide-react";
import type { SupportContact } from "./types";

/**
 * Admin contact details shown on the public checkout page so the customer
 * knows who to reach for approval confirmation, plus any bank/wallet payment
 * instructions the admin configured.
 */
export function SupportContactBlock({ contact }: { contact: SupportContact }) {
  const hasChannel = Boolean(
    contact.supportPhone || contact.supportWhatsapp || contact.supportEmail,
  );
  if (!hasChannel && !contact.paymentInstructions) return null;

  return (
    <div className="card mt-4 flex flex-col gap-3 p-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
        Need help?
      </p>

      {contact.paymentInstructions && (
        <div className="rounded-lg bg-[var(--surface-2)] p-3 text-[12.5px] whitespace-pre-line text-[var(--ink-soft)]">
          {contact.paymentInstructions}
        </div>
      )}

      {hasChannel && (
        <div className="flex flex-col gap-2 text-[13px]">
          {contact.supportName && (
            <div className="font-medium text-[var(--ink)]">{contact.supportName}</div>
          )}
          {contact.supportPhone && (
            <a
              href={`tel:${contact.supportPhone}`}
              className="flex items-center gap-2 text-[var(--ink-soft)] no-underline hover:text-[var(--ink)]"
            >
              <Phone size={14} className="shrink-0" />
              {contact.supportPhone}
            </a>
          )}
          {contact.supportWhatsapp && (
            <a
              href={`https://wa.me/${contact.supportWhatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[var(--ink-soft)] no-underline hover:text-[var(--ink)]"
            >
              <MessageCircle size={14} className="shrink-0" />
              WhatsApp {contact.supportWhatsapp}
            </a>
          )}
          {contact.supportEmail && (
            <a
              href={`mailto:${contact.supportEmail}`}
              className="flex items-center gap-2 text-[var(--ink-soft)] no-underline hover:text-[var(--ink)]"
            >
              <Mail size={14} className="shrink-0" />
              {contact.supportEmail}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
