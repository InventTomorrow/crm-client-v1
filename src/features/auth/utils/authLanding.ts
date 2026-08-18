import type { OnboardingStatus, OnboardingStep } from '../types';

/** Everything the landing decision needs, satisfied by both /auth/login and /auth/me. */
export interface AuthLandingUser {
  tenantId: string | null;
  onboardingStatus: OnboardingStatus;
  onboardingStep: OnboardingStep | null;
}

/**
 * Single source of truth for where a signed-in user belongs.
 *
 * The gate is `onboardingStatus` (a property of the *user*), never
 * `onboardingStep` (a property of whichever *workspace* is currently active).
 * Reading the step here is what used to drag a finished user back into the
 * wizard whenever they switched into a workspace that had not been through it.
 *
 * The step still decides *which* step an unfinished user resumes on, so closing
 * the browser after the category step returns them to the channel step.
 */
export function resolveAuthLanding(user: AuthLandingUser): string {
  if (user.onboardingStatus === 'EMAIL_UNVERIFIED') return '/auth/verify-email';

  // No workspace at all — nothing to resume into, and the wizard is the only
  // place that can create one.
  if (!user.tenantId || user.onboardingStep === 'WORKSPACE') return '/onboarding/workspace';

  // Setup finished once, for this account. Workspace switching cannot revoke it.
  if (user.onboardingStatus === 'COMPLETE') return '/dashboard';

  // Unfinished account, but this workspace has no step left to run — every
  // wizard endpoint would reject it (see OnboardingService). Let them in rather
  // than bounce them against a wall.
  if (!user.onboardingStep || user.onboardingStep === 'DONE') return '/dashboard';

  return `/onboarding/${user.onboardingStep.toLowerCase()}`;
}

/** True while the user still owes a setup step — used to gate the `(app)` segment. */
export function hasFinishedOnboarding(user: AuthLandingUser): boolean {
  return resolveAuthLanding(user) === '/dashboard';
}
