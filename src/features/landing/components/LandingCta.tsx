"use client";

import { useMe } from "@/features/auth/hooks/useAuth";
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
