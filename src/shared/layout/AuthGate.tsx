"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { hasFinishedOnboarding, resolveAuthLanding } from "@/features/auth/utils/authLanding";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Gate for every `(app)` page. No session → sign-in. Session but unfinished
 * setup → back to the step still owed, so entering the app through any route
 * (landing CTA, bookmark, refresh) requires onboarding to be complete.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, error } = useMe();
  const onboardingComplete = !!user && hasFinishedOnboarding(user);

  useEffect(() => {
    if (isLoading) return;
    if (error || !user) {
      router.replace("/auth/login");
      return;
    }
    if (!onboardingComplete) {
      router.replace(resolveAuthLanding(user));
    }
  }, [isLoading, error, user, onboardingComplete, router]);

  if (isLoading || error || !user || !onboardingComplete) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return <>{children}</>;
}
