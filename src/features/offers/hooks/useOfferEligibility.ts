"use client";
import { useSubscription } from "@/features/billing/hooks/useBilling";

/**
 * The campaign is an upsell aimed at accounts that have never paid: no
 * subscription at all, or a live free trial. Anyone already on a paid plan is
 * shown nothing — a countdown to a discount they cannot use is just noise.
 *
 * `isResolved` exists so surfaces can stay hidden until the subscription is
 * known, instead of flashing a banner at a paying customer for one frame.
 */
export function useOfferEligibility(): { isEligible: boolean; isResolved: boolean } {
  const { data: subscription, isLoading, isError } = useSubscription();

  if (isLoading || isError) return { isEligible: false, isResolved: false };

  const isEligible =
    !subscription || subscription.status === "TRIALING" || subscription.plan?.isTrial === true;

  return { isEligible, isResolved: true };
}
