"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMe } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for where every landing CTA points: logged-in users
 * jump straight to the inbox, everyone else goes to login.
 */
function useCtaHref() {
  const { user } = useMe();
  return user ? "/inbox" : "/auth/login";
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
