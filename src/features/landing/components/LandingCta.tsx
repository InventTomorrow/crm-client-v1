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
 * Where every landing CTA points — signup, for everyone.
 *
 * Deliberately session-blind: a stale cookie from a half-finished account used
 * to send "Get Started" straight into the wizard, which reads as the landing
 * page being broken. Login and the post-register flow already route by
 * onboarding state (see resolveAuthLanding), so nothing is lost by keeping
 * this link fixed.
 */
const CTA_HREF = "/auth/register";

/** Primary pill button used across the landing page. */
export function PrimaryCta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn("hover:text-white", className)}
    >
      <Link href={CTA_HREF}>{children}</Link>
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

/** Inline text link variant (e.g. "Connect WhatsApp" in body copy). */
export function CtaTextLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={CTA_HREF} className={className}>
      {children}
    </Link>
  );
}
