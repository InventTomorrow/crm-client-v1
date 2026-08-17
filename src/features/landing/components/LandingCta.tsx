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
 * Where every landing CTA points: a signed-in user with finished setup jumps
 * straight to the inbox, one still mid-onboarding resumes the step they owe,
 * and everyone else goes to signup.
 */
function useCtaHref() {
  const { user } = useMe();
  if (!user) return "/auth/register";
  return hasFinishedOnboarding(user) ? "/inbox" : resolveAuthLanding(user);
}

/** Primary pill button used across the landing page. */
export function PrimaryCta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const href = useCtaHref();
  return (
    <Button
      asChild
      variant="ghost"
      className={cn("hover:text-white", className)}
    >
      <Link href={href}>{children}</Link>
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
  const href = useCtaHref();
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
