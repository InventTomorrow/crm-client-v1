import { z } from "zod";

/**
 * The live promo campaign. Mirrors the server's ActiveOffer projection —
 * see server/src/modules/promo-offers/promo-offer.util.ts.
 */
export const activeOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  discountPercent: z.number().int(),
  durationDays: z.number().int(),
  startsAt: z.string(),
  endsAt: z.string(),
});

export type ActiveOffer = z.infer<typeof activeOfferSchema>;

/** Countdown parts, recomputed once a second by useOfferCountdown. */
export interface OfferTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasExpired: boolean;
}
