/** Launch-offer discount expiry. Update this date to restart/extend the countdown. */
export const OFFER_END_DATE = new Date("2026-07-21T23:59:59");

/** Shown in the app sidebar promo card and the landing pricing section. */
export const OFFER_DISCOUNT_PERCENT = 50;

/** Days left until the offer expires, floored at 0. Recompute on each render — don't cache. */
export function getOfferDaysRemaining(): number {
  const diffMs = OFFER_END_DATE.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatOfferCountdown(daysRemaining: number): string {
  if (daysRemaining <= 0) return "Offer ends today";
  if (daysRemaining === 1) return "Ends in 1 day";
  return `Ends in ${daysRemaining} days`;
}
