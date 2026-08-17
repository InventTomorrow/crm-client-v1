'use client';
import { useMe } from '@/features/auth/hooks/useAuth';
import { resolveAuthLanding } from '@/features/auth/utils/authLanding';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** The success screen, shown *after* the last step — DONE is the state it celebrates. */
const COMPLETION_ROUTE = '/onboarding/done';

/**
 * Guards the wizard from the other side of {@link AuthGate}: signed-out users go
 * to sign-in, and users whose setup is already finished are sent into the app
 * instead of being able to replay steps the server would reject anyway.
 *
 * Deliberately does not police *which* step is open — the wizard advances the
 * server step then routes, so matching on the exact step would bounce a user
 * backwards on a stale read.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, error } = useMe();

  const landing = user ? resolveAuthLanding(user) : null;
  const belongsHere =
    pathname === COMPLETION_ROUTE || (!!landing && landing.startsWith('/onboarding/'));

  useEffect(() => {
    if (isLoading) return;
    if (error || !user) {
      router.replace('/auth/login');
      return;
    }
    if (!belongsHere && landing) router.replace(landing);
  }, [isLoading, error, user, belongsHere, landing, router]);

  if (isLoading || error || !user || !belongsHere) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return <>{children}</>;
}
