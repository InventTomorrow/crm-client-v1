"use client";

import { useMe } from "@/features/auth/hooks/useAuth";
import { useRequestPlan } from "@/features/billing/hooks/useBilling";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Single source of truth for where every landing CTA points: logged-in users
 * jump straight to the inbox, everyone else goes to login.
 */
function useCtaHref() {
  const { user } = useMe();
  return user ? "/inbox" : "/auth/register";
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
 * Signed in: mint this workspace's checkout link and go straight there, so a
 * customer who already has an account never detours through the app to buy.
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
