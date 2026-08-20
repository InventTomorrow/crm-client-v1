"use client";
import { ArrowRight, Clock, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ActiveOffer } from "../types";
import { OfferCountdown } from "./OfferCountdown";

const DISMISSED_KEY_PREFIX = "asaanrabta:offer-banner-dismissed:";

interface OfferTopBannerProps {
  offer: ActiveOffer;
  ctaHref: string;
}

/**
 * Slim strip above the app content. Dismissal lasts the browser session only,
 * and never hides the sidebar timer — closing the strip should quiet the page,
 * not make the deadline disappear.
 */
export function OfferTopBanner({ offer, ctaHref }: OfferTopBannerProps) {
  const dismissedKey = `${DISMISSED_KEY_PREFIX}${offer.id}`;

  // Read once, during the first render. Safe against SSR because the offer is
  // query-driven — the server never has one, so this component only ever
  // mounts on the client.
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(dismissedKey) !== "1";
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    setIsVisible(false);
    try {
      window.sessionStorage.setItem(dismissedKey, "1");
    } catch {
      // Dismissal just won't survive a reload — not worth failing over.
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 bg-brand-amber px-10 py-2 text-white">
      <Clock className="clock-pulse hidden h-4 w-4 shrink-0 sm:block" />
      <p className="text-[13px] font-medium">
        <span className="font-semibold">Save {offer.discountPercent}% on any plan</span>
        <span className="hidden sm:inline">: {offer.title}</span>
      </p>
      <span className="hidden text-[12px] font-medium text-white/90 sm:inline">
        Ends in
      </span>
      <OfferCountdown endsAt={offer.endsAt} className="rounded-md bg-white/25 px-2 py-0.5" />
      <Link
        href={ctaHref}
        className="hidden items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[12px] font-semibold text-brand-amber-dark no-underline transition-opacity hover:opacity-90 sm:inline-flex"
      >
        Claim it <ArrowRight className="h-3 w-3" />
      </Link>
      <button
        type="button"
        aria-label="Dismiss offer"
        onClick={dismiss}
        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white active:scale-95"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
