/**
 * A plan someone chose before they could act on it.
 *
 * Picking a plan while signed out (or mid-signup) has to survive login, email
 * verification and the whole onboarding run before it can be redeemed —
 * minting a checkout link needs a workspace, and a brand-new account has none
 * until onboarding creates one. Parking the choice in localStorage keeps it
 * alive across those redirects and full page loads.
 */

const STORAGE_KEY = "asaanrabta.pending-plan";
/** Long enough to finish signup in another sitting, short enough to go stale. */
const INTENT_TTL_MS = 24 * 60 * 60 * 1000;

export interface PlanIntent {
  planId: string;
  savedAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function savePlanIntent(planId: string): void {
  if (!isBrowser() || !planId) return;
  try {
    const intent: PlanIntent = { planId, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // Private browsing / storage disabled — the user just picks again later.
  }
}

/** The stored choice, or null when absent, malformed or stale. */
export function readPlanIntent(): PlanIntent | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlanIntent>;
    if (typeof parsed?.planId !== "string" || typeof parsed?.savedAt !== "number") {
      clearPlanIntent();
      return null;
    }
    if (Date.now() - parsed.savedAt > INTENT_TTL_MS) {
      clearPlanIntent();
      return null;
    }
    return { planId: parsed.planId, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function clearPlanIntent(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — a stale intent expires on its own.
  }
}
