/** Landing FAQ entries — rendered in the FAQ section and emitted as FAQPage JSON-LD. */
export const LANDING_FAQ_ITEMS = [
  {
    question: "Win Leads While They Are Still Interested",
    answer: "Fast replies help you reach customers before competitors do.",
  },
  {
    question: "Save Your Team Hours Every Day",
    answer:
      "Let AI handle the repeat questions while your team focuses on closing deals and high-value conversations.",
  },
  {
    question: "Never Lose Track Of A Customer",
    answer:
      "Every WhatsApp inquiry is saved with context, history, and status — no more digging through chats to find what was promised.",
  },
  {
    question: "Manage Multiple Numbers Easily",
    answer:
      "Connect up to 3 WhatsApp numbers in one dashboard. Perfect for businesses with multiple branches or teams.",
  },
  {
    question: "Grow Without Hiring More Staff",
    answer:
      "Scale your customer support and sales conversations without proportional headcount growth. Your AI assistant works 24/7.",
  },
];

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
