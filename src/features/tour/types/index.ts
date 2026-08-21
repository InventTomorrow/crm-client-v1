import { z } from 'zod';
import { TOUR_IDS } from '../constants';

/** Mirrors completeTourSchema on the server. */
export const completeTourSchema = z.object({
  tourId: z.enum(TOUR_IDS),
});
export type CompleteTourData = z.infer<typeof completeTourSchema>;

export interface CompleteTourResponse {
  completedTours: string[];
}
