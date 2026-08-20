"use client";
import { ArrowRight, Timer } from "lucide-react";
import Link from "next/link";
import type { ActiveOffer } from "../types";
import { OfferCountdown } from "./OfferCountdown";

interface SidebarOfferTimerProps {
  offer: ActiveOffer;
  /** Trial state the campaign card takes over from, e.g. "Trial ends in 4 days". */
  subtitle?: string | null;
}

/**
 * The campaign's permanent home. Unlike the banner this cannot be dismissed —
 * once the dialog has been closed it is the only place the deadline still
 * lives inside the app.
 */
export function SidebarOfferTimer({ offer, subtitle }: SidebarOfferTimerProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-brand-amber/30 bg-brand-amber/10 px-3 py-2.5 text-brand-amber-dark dark:text-brand-amber-light">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold">
        <Timer size={12} className="clock-pulse shrink-0" />
        Save {offer.discountPercent}% on any plan
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide">
          Offer ends in
        </span>
        <OfferCountdown endsAt={offer.endsAt} className="text-[13px]" />
      </div>
      {subtitle && (
        <div className="text-[10.5px] font-medium leading-snug">{subtitle}</div>
      )}
      <Link
        href="/settings/billing"
        className="mt-0.5 flex items-center justify-center gap-1 rounded-md bg-brand-amber px-2.5 py-1.5 text-[11.5px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
      >
        Upgrade and save {offer.discountPercent}% <ArrowRight size={12} />
      </Link>
    </div>
  );
}
