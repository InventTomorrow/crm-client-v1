"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import { createSelfServeCheckoutLink } from "../services/billingService";
import { clearPlanIntent, readPlanIntent } from "../utils/planIntent";
import { shouldNagAboutPricing, markPricingNagShown } from "../utils/pricingNag";
import { useEntitlementStatus, useSubscription } from "./useBilling";

/** Pages that must never be interrupted — they ARE the upgrade journey. */
const NEVER_REDIRECT = ["/pricing", "/settings/billing", "/onboarding"];

function isProtectedFromRedirect(pathname: string): boolean {
  return NEVER_REDIRECT.some((route) => pathname.startsWith(route));
}

/**
 * Routing that can only be decided once the user is signed in, their workspace
 * exists and their plan is known.
 *
 * Two jobs:
 *  1. Redeem a plan chosen before signing in — mint that workspace's checkout
 *     link and hand off to it. This is the last leg of the landing-page →
 *     signup → onboarding → checkout journey, and it runs here because it is
 *     the first point where a tenant exists to bill.
 *  2. Point free-trial accounts at the pricing page, at most once a day, so
 *     the reminder never turns into a redirect loop on every navigation.
 *
 * Expired and planless accounts are not handled here, and are deliberately not
 * redirected at all — the workspace stays readable and RouteGuard's banner
 * carries the upgrade CTA instead.
 */
export function usePostAuthRouting(): void {
  const router = useRouter();
  const pathname = usePathname();
  const { data: entitlement } = useEntitlementStatus();
  const { data: subscription } = useSubscription();
  // One attempt per page load; the redirect it triggers unmounts everything.
  const hasActed = useRef(false);

  useEffect(() => {
    if (hasActed.current) return;

    const intent = readPlanIntent();
    if (intent) {
      hasActed.current = true;
      // Clear first: a failure here must not strand the choice in storage and
      // re-fire this on every page the user visits afterwards.
      clearPlanIntent();
      createSelfServeCheckoutLink(intent.planId)
        .then(({ checkoutUrl }) => window.location.assign(checkoutUrl))
        .catch((error) => {
          toast.error(extractErrorMessage(error, "That plan is no longer available"));
          router.push("/pricing");
        });
      return;
    }

    // Everything below only makes sense once the plan is actually known.
    if (!entitlement?.live || !subscription?.plan) return;
    if (isProtectedFromRedirect(pathname)) return;
    if (!subscription.plan.isTrial) return;

    if (shouldNagAboutPricing()) {
      hasActed.current = true;
      markPricingNagShown();
      router.push("/pricing");
    }
  }, [entitlement, subscription, pathname, router]);
}
