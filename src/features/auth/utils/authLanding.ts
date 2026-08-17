import type { OnboardingStatus, OnboardingStep } from '../types';

/** Everything the landing decision needs, satisfied by both /auth/login and /auth/me. */
export interface AuthLandingUser {
  tenantId: string | null;
  onboardingStatus: OnboardingStatus;
  onboardingStep: OnboardingStep | null;
}

/**
 * Single source of truth for where a signed-in user belongs. Onboarding is
 * mandatory: an account that has not finished the wizard is sent back to the
 * step it still owes, no matter how it arrived (login, landing CTA, a bookmarked
 * app URL). `/dashboard` is only reachable once setup is DONE.
 */
export function resolveAuthLanding(user: AuthLandingUser): string {
  if (user.onboardingStatus === 'EMAIL_UNVERIFIED') return '/auth/verify-email';
  if (!user.tenantId || user.onboardingStep === 'WORKSPACE') return '/onboarding/workspace';
  if (user.onboardingStep && user.onboardingStep !== 'DONE') {
    return `/onboarding/${user.onboardingStep.toLowerCase()}`;
  }
  return '/dashboard';
}

/** True while the user still owes a setup step — used to gate the `(app)` segment. */
export function hasFinishedOnboarding(user: AuthLandingUser): boolean {
  return resolveAuthLanding(user) === '/dashboard';
}
