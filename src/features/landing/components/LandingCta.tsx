"use client";

import { useMe } from "@/features/auth/hooks/useAuth";
import { hasFinishedOnboarding, resolveAuthLanding } from "@/features/auth/utils/authLanding";
import { useRequestPlan } from "@/features/billing/hooks/useBilling";
import { savePlanIntent } from "@/features/billing/utils/planIntent";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Where a landing CTA points when nobody is signed in.
 *
 * Also where a half-finished account is sent: a stale cookie from an abandoned
 * signup used to drop "Get Started" straight into the wizard, which reads as the
 * landing page being broken. Login and the post-register flow already route by
 * onboarding state (see resolveAuthLanding), so nothing is lost.
 */
const CTA_HREF = "/auth/register";

/** Which app screen a CTA sends a fully signed-in user to. */
export type SignedInTarget = "dashboard" | "inbox";

const SIGNED_IN_CTA: Record<SignedInTarget, { href: string; label: string }> = {
  dashboard: { href: "/dashboard", label: "Dashboard" },
  inbox: { href: "/inbox", label: "Inbox" },
};

/** Resolves the signed-in destination, or null while the CTA should stay a signup link. */
function useSignedInCta(target: SignedInTarget) {
  const { user } = useMe();
  if (!user || !hasFinishedOnboarding(user)) return null;
  return SIGNED_IN_CTA[target];
}

/** Primary pill button used across the landing page. */
export function PrimaryCta({
  children,
  className,
  signedInTarget = "inbox",
}: {
  children: ReactNode;
  className?: string;
  signedInTarget?: SignedInTarget;
}) {
  const signedInCta = useSignedInCta(signedInTarget);

  return (
    <Button
      asChild
      variant="ghost"
      className={cn("hover:text-white", className)}
    >
      <Link href={signedInCta?.href ?? CTA_HREF}>{signedInCta?.label ?? children}</Link>
    </Button>
  );
}

/**
 * A pricing card's CTA, which has to do more than the generic one.
 *
 * Signed in with setup finished: mint this workspace's checkout link and go
 * straight there, so a customer who already has an account never detours
 * through the app to buy.
 * Signed in mid-onboarding: no workspace exists to bill yet, so park the choice
 * and resume setup — usePostAuthRouting redeems it on the way in.
 * Signed out: carry the plan into signup as `?plan=`, where it is parked and
 * redeemed once onboarding has created a workspace to bill.
 */
export function PlanCta({
  planId,
  children,
  className,
}: {
  planId: string;
  children: ReactNode;
  className?: string;
}) {
  const { user } = useMe();
  const requestPlan = useRequestPlan();

  if (!user) {
    return (
      <Button asChild variant="ghost" className={cn("hover:text-white", className)}>
        <Link href={`/auth/register?plan=${encodeURIComponent(planId)}`}>{children}</Link>
      </Button>
    );
  }

  if (!hasFinishedOnboarding(user)) {
    return (
      <Button
        asChild
        variant="ghost"
        className={cn("hover:text-white", className)}
        onClick={() => savePlanIntent(planId)}
      >
        <Link href={resolveAuthLanding(user)}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn("hover:text-white", className)}
      disabled={requestPlan.isPending}
      onClick={() => requestPlan.mutate(planId)}
    >
      {requestPlan.isPending ? "Taking you to checkout…" : children}
    </Button>
  );
}

/**
 * Inline text link variant (e.g. "Connect WhatsApp" in body copy).
 *
 * Only the destination changes for a signed-in user — the wording is part of a
 * sentence, so swapping it for "Inbox" would break the copy.
 */
export function CtaTextLink({
  children,
  className,
  signedInTarget = "inbox",
}: {
  children: ReactNode;
  className?: string;
  signedInTarget?: SignedInTarget;
}) {
  const signedInCta = useSignedInCta(signedInTarget);

  return (
    <Link href={signedInCta?.href ?? CTA_HREF} className={className}>
      {children}
    </Link>
  );
}
