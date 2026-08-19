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
      "Every WhatsApp inquiry is saved with its context, history, and status, so nobody has to scroll back through chats to find what was promised.",
  },
  {
    question: "Manage Multiple Numbers Easily",
    answer:
      "Connect up to 3 WhatsApp numbers in one dashboard. Perfect for businesses with multiple branches or teams.",
  },
  {
    question: "Grow Without Hiring More Staff",
    answer:
      "Handle more conversations without adding people. Your AI assistant keeps replying at night, on weekends, and during rush hours.",
  },
];

/**
 * Coarse "ends in N days" label for a plan carrying its own offer date. The
 * platform-wide campaign is admin-managed and ticks live instead — see
 * features/offers.
 */
export function formatOfferCountdown(daysRemaining: number): string {
  if (daysRemaining <= 0) return "Offer ends today";
  if (daysRemaining === 1) return "Ends in 1 day";
  return `Ends in ${daysRemaining} days`;
}
