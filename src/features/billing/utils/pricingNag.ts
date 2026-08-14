/**
 * Throttle for the free-trial pricing reminder.
 *
 * A trial account is nudged toward /pricing, but at most once a day — without
 * a throttle the redirect fires on every navigation and the product becomes
 * unusable for anyone still evaluating it.
 */

const STORAGE_KEY = "asaanrabta.pricing-nag-at";
const NAG_INTERVAL_MS = 24 * 60 * 60 * 1000;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function shouldNagAboutPricing(): boolean {
  if (!isBrowser()) return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const lastShownAt = Number(raw);
    if (!Number.isFinite(lastShownAt)) return true;
    return Date.now() - lastShownAt >= NAG_INTERVAL_MS;
  } catch {
    // Storage unavailable — never nag rather than nag on every page.
    return false;
  }
}

export function markPricingNagShown(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Nothing to do; shouldNagAboutPricing() fails closed.
  }
}
