import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

/**
 * A number input that may legitimately be left empty.
 *
 * `z.coerce.number()` reads an empty string as 0, so a blank "Years of
 * experience" would be saved as a real zero rather than "not set". Blank maps
 * to null before coercion, which is also what lets these fields bind straight
 * to a text input in react-hook-form.
 */
const optionalNumber = (schema: z.ZodType<number, unknown>) =>
  z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined ? null : value,
    schema.nullable(),
  ) as unknown as z.ZodType<
    number | null,
    string | number | null | undefined
  >;

/** Mirrors `PractitionerVisibility` on the server. */
export const PRACTITIONER_VISIBILITIES = [
  'HIDDEN',
  'LISTED',
  'BOOKABLE',
] as const;
export type PractitionerVisibility = (typeof PRACTITIONER_VISIBILITIES)[number];

/** Mirrors `Weekday` on the server. */
export const WEEKDAYS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const VISIBILITY_META: Record<
  PractitionerVisibility,
  { label: string; description: string }
> = {
  HIDDEN: {
    label: "Don't show",
    description:
      'The assistant never mentions this practitioner; enquiries go to a coordinator.',
  },
  LISTED: {
    label: 'Profile only',
    description: 'The assistant may show the profile, but never offers a time.',
  },
  BOOKABLE: {
    label: 'Profile & booking',
    description:
      "The assistant may show the profile and book against this person's own calendar.",
  },
};

/** How exposed each level is — used to stop the UI offering more than the workspace allows. */
const VISIBILITY_RANK: Record<PractitionerVisibility, number> = {
  HIDDEN: 0,
  LISTED: 1,
  BOOKABLE: 2,
};

/**
 * Mirrors `resolveVisibility` on the server: a per-practitioner override may
 * only narrow the workspace default, never widen it. The form disables the
 * wider options so the UI cannot express something the server would clamp.
 */
export function isVisibilityAllowed(
  workspaceDefault: PractitionerVisibility,
  candidate: PractitionerVisibility,
): boolean {
  return VISIBILITY_RANK[candidate] <= VISIBILITY_RANK[workspaceDefault];
}

const LOCAL_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const bookingWindowSchema = z
  .object({
    startTime: z.string().regex(LOCAL_TIME, 'Use HH:mm'),
    endTime: z.string().regex(LOCAL_TIME, 'Use HH:mm'),
  })
  .refine((window) => window.startTime < window.endTime, {
    path: ['endTime'],
    message: 'End must be after start',
  });

/** Mirrors `practitionerScheduleSchema` on the server. Nulls inherit the clinic default. */
export const practitionerScheduleSchema = z
  .object({
    availableDays: z.array(z.enum(WEEKDAYS)).default([]),
    workingHours: z.array(bookingWindowSchema).default([]),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(5)
      .max(480)
      .nullable()
      .optional(),
    bufferMinutes: z.coerce
      .number()
      .int()
      .min(0)
      .max(240)
      .nullable()
      .optional(),
    maxPerDay: z.coerce.number().int().min(1).max(100).nullable().optional(),
    minAdvanceHours: z.coerce
      .number()
      .int()
      .min(0)
      .max(720)
      .nullable()
      .optional(),
    maxAdvanceDays: z.coerce
      .number()
      .int()
      .min(1)
      .max(365)
      .nullable()
      .optional(),
  })
  .refine(
    (schedule) =>
      schedule.availableDays.length === 0 || schedule.workingHours.length > 0,
    {
      path: ['workingHours'],
      message: 'Add at least one time window for the days selected',
    },
  );

/** Mirrors `createPractitionerSchema` on the server. */
export const practitionerFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(120),
  title: z.string().trim().max(30).optional(),
  designation: z.string().trim().max(120).optional(),
  specialties: z.array(z.string().trim().min(1)).default([]),
  qualifications: z.array(z.string().trim().min(1)).default([]),
  registrationNumber: z.string().trim().max(60).optional(),
  yearsExperience: optionalNumber(z.coerce.number().int().min(0).max(80)),
  bio: z.string().trim().max(2000).optional(),
  /** Optional. When set, the assistant sends the profile as a photo with a caption. */
  photoUrl: z.string().trim().max(2000).nullable().optional(),
  languages: z.array(z.string().trim().min(1)).default([]),
  gender: z.string().trim().max(40).optional(),
  consultationFee: optionalNumber(z.coerce.number().min(0)),
  currency: z.string().trim().length(3).default('PKR'),
  clinicalServiceIds: z.array(z.string()).default([]),
  clinicLocationIds: z.array(z.string()).default([]),
  schedule: practitionerScheduleSchema.nullable().optional(),
  visibility: z.enum(PRACTITIONER_VISIBILITIES).nullable().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export type PractitionerFormValues = z.infer<typeof practitionerFormSchema>;

/** Numbers reach the form as text, so the input and output shapes differ. */
export type PractitionerForm = UseFormReturn<
  z.input<typeof practitionerFormSchema>,
  unknown,
  PractitionerFormValues
>;

/** Shared by every field group the practitioner form renders. */
export interface PractitionerFormSectionProps {
  form: PractitionerForm;
  isSaving: boolean;
}
export type PractitionerSchedule = z.infer<typeof practitionerScheduleSchema>;

/** What the schedule editor holds — defaults are still unresolved there. */
export type PractitionerScheduleInput = z.input<typeof practitionerScheduleSchema>;
export type BookingWindow = z.infer<typeof bookingWindowSchema>;

export interface Practitioner {
  id: string;
  tenantId: string;
  fullName: string;
  title: string | null;
  designation: string | null;
  specialties: string[];
  qualifications: string[];
  registrationNumber: string | null;
  yearsExperience: number | null;
  bio: string | null;
  photoUrl: string | null;
  languages: string[];
  gender: string | null;
  consultationFee: number | null;
  currency: string;
  clinicalServiceIds: string[];
  clinicLocationIds: string[];
  userId: string | null;
  schedule: PractitionerSchedule | null;
  visibility: PractitionerVisibility | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mirrors `GET /practitioners/:id/preview`. The server resolves the stored
 * setting against the clinic-wide ceiling, so `effectiveVisibility` is what the
 * assistant actually honours — which is not always what the form field says.
 */
export interface PractitionerAssistantPreview {
  workspaceVisibility: PractitionerVisibility;
  overrideVisibility: PractitionerVisibility | null;
  effectiveVisibility: PractitionerVisibility;
  /** May the assistant name this person at all? */
  mentionable: boolean;
  /** May it offer their own calendar? */
  bookable: boolean;
  /** The line sent under their photo. */
  caption: string;
  hasPhoto: boolean;
}

export interface PractitionerTimeOff {
  id: string;
  tenantId: string;
  practitionerId: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  createdAt: string;
}

export const timeOffFormSchema = z
  .object({
    startsAt: z.string().min(1, 'Start is required'),
    endsAt: z.string().min(1, 'End is required'),
    reason: z.string().trim().max(200).optional(),
  })
  .refine((block) => new Date(block.endsAt) > new Date(block.startsAt), {
    path: ['endsAt'],
    message: 'End must be after start',
  });
export type TimeOffFormValues = z.infer<typeof timeOffFormSchema>;

export interface PractitionerFilters {
  search?: string;
  specialty?: string;
  clinicalServiceId?: string;
  isActive?: boolean;
}

/** Display name including the title, e.g. "Dr. Ayesha Khan". */
export function practitionerDisplayName(practitioner: Practitioner): string {
  return practitioner.title?.trim()
    ? `${practitioner.title.trim()} ${practitioner.fullName}`
    : practitioner.fullName;
}
