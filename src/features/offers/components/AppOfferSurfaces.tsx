"use client";
import { useActiveOffer } from "../hooks/useActiveOffer";
import { useOfferEligibility } from "../hooks/useOfferEligibility";
import { OfferDialog } from "./OfferDialog";
import { OfferTopBanner } from "./OfferTopBanner";

const BILLING_HREF = "/settings/billing";

/**
 * Single mount point for the in-app campaign surfaces (strip + dialog). The
 * sidebar timer is rendered by the sidebar itself so it survives the strip
 * being dismissed.
 */
export function AppOfferSurfaces() {
  const { data: offer } = useActiveOffer();
  const { isEligible } = useOfferEligibility();

  if (!offer || !isEligible) return null;

  return (
    <>
      <OfferTopBanner offer={offer} ctaHref={BILLING_HREF} />
      <OfferDialog offer={offer} ctaHref={BILLING_HREF} ctaLabel="Claim the discount" />
    </>
  );
}
