import { z } from 'zod';

export const FOLLOW_UP_LEAD_STATUSES = ['PROSPECT', 'COLD', 'WARM', 'HOT', 'BOOKED', 'CLOSED'] as const;
export type FollowUpLeadStatus = (typeof FOLLOW_UP_LEAD_STATUSES)[number];

// Mirrors the server's FOLLOW_UP_BOUNDS; the server validates every save again.
export const FOLLOW_UP_BOUNDS = {
  intervalHours: { min: 1, max: 168 },
  maxAttempts: { min: 1, max: 3 },
  dailyLimit: { min: 10, max: 300 },
} as const;

const boundedWholeNumber = (bounds: { min: number; max: number }, unit: string) =>
  z
    .number({ error: 'Enter a number' })
    .int('Use a whole number')
    .min(bounds.min, `At least ${bounds.min} ${unit}`)
    .max(bounds.max, `At most ${bounds.max} ${unit}`);

export const followUpSettingsSchema = z.object({
  enabled: z.boolean(),
  intervalHours: boundedWholeNumber(FOLLOW_UP_BOUNDS.intervalHours, 'hours'),
  maxAttempts: boundedWholeNumber(FOLLOW_UP_BOUNDS.maxAttempts, 'follow-ups'),
  dailyLimit: boundedWholeNumber(FOLLOW_UP_BOUNDS.dailyLimit, 'a day'),
  priority: z
    .array(z.enum(FOLLOW_UP_LEAD_STATUSES))
    .min(1, 'Pick at least one status to follow up')
    .refine((statuses) => new Set(statuses).size === statuses.length, 'A status is listed twice'),
});
export type FollowUpSettingsForm = z.infer<typeof followUpSettingsSchema>;

export type DailyLimitRisk = 'NONE' | 'HIGH';

/** Mirrors the server's FollowUpSettingsView. */
export interface FollowUpSettingsView {
  settings: FollowUpSettingsForm;
  isAvailable: boolean;
  eligibleStatuses: FollowUpLeadStatus[];
  highRiskDailyLimit: number;
  effectiveDailyLimit: number;
  numberAgeDays: number;
  limitRisk: DailyLimitRisk;
}

export type FollowUpPauseSource = 'CUSTOMER' | 'AGENT';

export interface LeadFollowUpPause {
  followUpsPausedAt: string | null;
  followUpsPausedBy: FollowUpPauseSource | null;
}

export type FollowUpAnalyticsRange = '3d' | '7d' | '30d' | '90d';

export interface ReplyRate {
  sent: number;
  replied: number;
  replyRate: number;
}

/** Mirrors the server's FollowUpAnalyticsView. */
export interface FollowUpAnalyticsView {
  isAvailable: boolean;
  replyWindowHours: number;
  attempts: (ReplyRate & { attempt: number })[];
  totals: ReplyRate;
}

export type FollowUpCycleState = 'SCHEDULED' | 'BLOCKED' | 'DONE';

/** Mirrors the server's LeadFollowUpStatusView. */
export interface LeadFollowUpStatus extends LeadFollowUpPause {
  isEnabled: boolean;
  state: FollowUpCycleState | null;
  nextFollowUpAt: string | null;
  attemptsSent: number;
  maxAttempts: number;
}
