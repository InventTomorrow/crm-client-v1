"use client";
import { CheckCircle2 } from "lucide-react";
import { SupportContactBlock } from "./SupportContactBlock";
import type { SupportContact } from "./types";

/**
 * Terminal state after a successful submit — the request is queued for admin
 * approval, so the contact block stays visible for follow-up.
 */
export function SubmissionSuccess({
  planName,
  contact,
}: {
  planName: string;
  contact: SupportContact;
}) {
  return (
    <>
      <div className="card mt-4 flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
          <CheckCircle2 size={30} className="text-success-foreground" />
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[var(--ink)]">
            We&apos;re reviewing your payment
          </p>
          <p className="mt-1 text-[13px] text-[var(--ink-mute)]">
            Your request for <strong className="font-medium text-[var(--ink-soft)]">{planName}</strong>{" "}
            has been received. We&apos;ll verify your receipt and activate your
            workspace shortly — you&apos;ll hear from us by email.
          </p>
        </div>
      </div>

      <SupportContactBlock contact={contact} />
    </>
  );
}
