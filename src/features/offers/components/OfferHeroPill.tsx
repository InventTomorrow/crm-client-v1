"use client";
import { Tag } from "lucide-react";
import type { ActiveOffer } from "../types";
import { OfferCountdown } from "./OfferCountdown";

/**
 * Hero reinforcement, sitting under the primary CTAs. Deliberately a link
 * rather than a banner — a visitor who reacts to the discount should land on
 * the plans, not have to hunt for them.
 */
export function OfferHeroPill({ offer }: { offer: ActiveOffer | null }) {
  if (!offer) return null;

  return (
    <a
      href="#pricing"
      className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-brand-amber/30 bg-brand-amber/10 px-4 py-2 text-[13px] font-medium text-brand-amber-dark no-underline transition-colors hover:bg-brand-amber/20 sm:text-sm"
    >
      <Tag className="h-4 w-4 shrink-0" />
      <span>
        <span className="font-semibold">Save {offer.discountPercent}%</span> on any plan
      </span>
      <span className="text-brand-amber-dark/30">|</span>
      <span className="font-medium">Ends in</span>
      <OfferCountdown endsAt={offer.endsAt} />
    </a>
  );
}
