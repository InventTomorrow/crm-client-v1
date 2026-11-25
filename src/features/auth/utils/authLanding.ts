import type { OnboardingStatus, OnboardingStep } from '../types';

/** Everything the landing decision needs, satisfied by both /auth/login and /auth/me. */
export interface AuthLandingUser {
  tenantId: string | null;
  onboardingStatus: OnboardingStatus;
  onboardingStep: OnboardingStep | null;
  isAffiliate?: boolean;
}

export const AFFILIATE_HOME = '/affiliate';
const WORKSPACE_SETUP_ROUTE = '/onboarding/workspace';

/** An affiliate who has not created a business workspace (and doesn't have to). */
export function isAffiliateOnlyAccount(user: AuthLandingUser): boolean {
  return !!user.isAffiliate && !user.tenantId && user.onboardingStatus !== 'EMAIL_UNVERIFIED';
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

  // Affiliates need no workspace; they can still create one later from their dashboard.
  if (isAffiliateOnlyAccount(user)) return AFFILIATE_HOME;

  // No workspace at all — nothing to resume into, and the wizard is the only
  // place that can create one.
  if (!user.tenantId || user.onboardingStep === 'WORKSPACE') return WORKSPACE_SETUP_ROUTE;

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

/** The dashboard a signed-in user returns to, or null while they still owe a setup step. */
export function resolveHomeDashboard(user: AuthLandingUser): string | null {
  const landing = resolveAuthLanding(user);
  return landing === '/dashboard' || landing === AFFILIATE_HOME ? landing : null;
}

/** Whether this `(app)` route may render; an affiliate-only account is limited to its dashboard. */
export function canEnterAppRoute(user: AuthLandingUser, pathname: string): boolean {
  if (hasFinishedOnboarding(user)) return true;
  return isAffiliateOnlyAccount(user) && pathname.startsWith(AFFILIATE_HOME);
}

/** The workspace wizard stays open to an affiliate-only account that decides to add a workspace. */
export function canOpenWorkspaceSetup(user: AuthLandingUser, pathname: string): boolean {
  return isAffiliateOnlyAccount(user) && pathname === WORKSPACE_SETUP_ROUTE;
}
