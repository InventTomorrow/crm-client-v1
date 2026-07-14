"use client";
import { formatOfferCountdown, getOfferDaysRemaining } from "@/features/landing/constants";
import { PLANS } from "@/features/landing/plans";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

// Sidebar surfaces the cheapest plan that's actually purchasable right now.
const offerPlan = PLANS.find((p) => !p.comingSoon) ?? PLANS[0];

/**
 * Temporary launch-offer promo — always shown for now since there's no
 * billing/upgrade flow yet. Once billing exists, gate this on whether the
 * workspace has already redeemed the offer.
 */
export function SidebarOfferCard() {
  const daysRemaining = getOfferDaysRemaining();
  if (daysRemaining <= 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
        <Zap size={12} className="shrink-0" />
        {offerPlan.discountPercentage}% off — limited time
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[13.5px] font-semibold text-[var(--ink)]">
          Rs {offerPlan.price}
        </span>
        {offerPlan.originalPrice && (
          <span className="text-[11px] text-[var(--ink-mute)] line-through">
            Rs {offerPlan.originalPrice}
          </span>
        )}
        <span className="text-[10.5px] text-[var(--ink-mute)]">
          {offerPlan.period}
        </span>
      </div>
      <div className="text-[10.5px] text-[var(--ink-mute)]">
        {formatOfferCountdown(daysRemaining)}
      </div>
      <Link
        href="/#pricing"
        className="mt-0.5 flex items-center justify-center gap-1 rounded-md bg-[var(--accent)] px-2.5 py-1.5 text-[11.5px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
      >
        Upgrade <ArrowRight size={12} />
      </Link>
    </div>
  );
}
