"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import {
  canEnterAppRoute,
  resolveAuthLanding,
} from "@/features/auth/utils/authLanding";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Gate for every `(app)` page. No session → sign-in. Session but unfinished
 * setup → back to the step still owed, so entering the app through any route
 * (landing CTA, bookmark, refresh) requires onboarding to be complete.
 * Affiliate-only accounts get the affiliate pages and nothing else.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, error } = useMe();
  const canEnter = !!user && canEnterAppRoute(user, pathname);

  useEffect(() => {
    if (isLoading) return;
    if (error || !user) {
      router.replace("/auth/login");
      return;
    }
    if (!canEnter) {
      router.replace(resolveAuthLanding(user));
    }
  }, [isLoading, error, user, canEnter, router]);

  if (isLoading || error || !user || !canEnter) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return <>{children}</>;
}
