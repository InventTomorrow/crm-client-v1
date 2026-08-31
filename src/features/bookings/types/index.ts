import { z } from "zod";

/** Mirrors `PractitionerVisibility` on the server. */
export const PRACTITIONER_VISIBILITIES = [
  "HIDDEN",
  "LISTED",
  "BOOKABLE",
] as const;
export type PractitionerVisibility = (typeof PRACTITIONER_VISIBILITIES)[number];

export const MEETING_TYPES = ["PHONE", "VIDEO", "IN_PERSON", "ANY"] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  PHONE: "Phone call",
  VIDEO: "Video call",
  IN_PERSON: "In person",
  ANY: "They choose",
};

export const WEEKDAYS = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
};

const localTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm");

/** One stretch of bookable hours. Slots are generated inside it, not listed by hand. */
export const bookingWindowSchema = z
  .object({
    startTime: localTimeSchema,
    endTime: localTimeSchema,
  })
  .refine((window) => window.endTime > window.startTime, {
    message: "Must end after it starts",
    path: ["endTime"],
  });

export type BookingWindow = z.infer<typeof bookingWindowSchema>;

/** Minutes between two local "HH:mm" times. */
export function minutesBetween(startTime: string, endTime: string): number {
  const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number);
  const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);
  return endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
}

/** Mirrors `bookingConfigUpsertSchema` on the server. */
export const bookingConfigFormSchema = z
  .object({
    label: z.string().min(1, "Give this booking a name"),
    description: z.string().nullable().optional(),
    meetingType: z.enum(MEETING_TYPES),
    durationMinutes: z.number().int().min(5, "At least 5 minutes").max(480),
    bufferMinutes: z.number().int().min(0).max(240),
    maxPerDay: z.number().int().min(1, "At least one per day").max(100),
    minAdvanceHours: z.number().int().min(0).max(720),
    maxAdvanceDays: z.number().int().min(1).max(365),
    timezone: z.string().min(1, "Pick a timezone"),
    availableDays: z.array(z.enum(WEEKDAYS)).min(1, "Pick at least one day"),
    workingHours: z
      .array(bookingWindowSchema)
      .min(1, "Add at least one time window"),
    confirmationMessage: z.string(),
    reminderMessage: z.string(),
    reminderLeadMinutes: z.number().int().min(0).max(10080),
    assignedStaffIds: z.array(z.string()),
    /**
     * Healthcare only. Whether the assistant may show practitioner profiles,
     * and whether it may book against their own calendars. A per-practitioner
     * override may narrow this but never widen it.
     */
    practitionerVisibility: z.enum(PRACTITIONER_VISIBILITIES).default("HIDDEN"),
    isActive: z.boolean(),
  })
  // Mirrors the server: a window shorter than the meeting offers nothing at all.
  .refine(
    (config) =>
      config.workingHours.some(
        (window) =>
          minutesBetween(window.startTime, window.endTime) >=
          config.durationMinutes,
      ),
    {
      message: "No window is long enough to fit one meeting",
      path: ["workingHours"],
    },
  );

export type BookingConfigFormData = z.infer<typeof bookingConfigFormSchema>;
export type BookingConfigFormInput = z.input<typeof bookingConfigFormSchema>;

export interface BookingConfig extends BookingConfigFormData {
  id: string;
  tenantId: string;
}

export interface AppointmentLeadSummary {
  id: string;
  name: string | null;
  phone: string | null;
}

/**
 * Which calendar an appointment sits on. Mirrors the server: CLINIC rows name a
 * service and no practitioner, PRACTITIONER rows name a doctor. Healthcare books
 * both; every other vertical only ever produces CLINIC-shaped rows.
 */
export const BOOKING_TYPES = ["CLINIC", "PRACTITIONER"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

/** The doctor an appointment was booked with, resolved server-side from its id. */
export interface AppointmentPractitionerSummary {
  id: string;
  fullName: string;
  title: string | null;
  designation: string | null;
  specialties: string[];
  photoUrl: string | null;
}

export interface AppointmentClinicalServiceSummary {
  id: string;
  name: string;
  category: string | null;
}

export interface Appointment {
  id: string;
  tenantId: string;
  leadId: string | null;
  conversationId: string | null;
  customerName: string | null;
  customerPhone: string;
  /** ISO-8601 UTC. */
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  staffId: string | null;
  /** Healthcare, doctor bookings only — null on every clinic-calendar row. */
  practitionerId: string | null;
  clinicalServiceId: string | null;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  lead?: AppointmentLeadSummary | null;
  practitioner?: AppointmentPractitionerSummary | null;
  clinicalService?: AppointmentClinicalServiceSummary | null;
}

export type SlotUnavailableReason = "BOOKED" | "TOO_SOON" | "DAY_FULL";

export interface AvailabilitySlot {
  /** Local "HH:mm" start in the config timezone. */
  time: string;
  /** Local "HH:mm" end — `time` + durationMinutes. */
  endTime: string;
  /** Ready-to-read range, e.g. "2:00 PM – 2:30 PM". */
  label: string;
  /** ISO-8601 UTC instant the slot starts. */
  startsAt: string;
  /** ISO-8601 UTC instant the slot ends. */
  endsAt: string;
  isAvailable: boolean;
  unavailableReason?: SlotUnavailableReason;
}

export interface AvailabilityDay {
  /** Local "YYYY-MM-DD" in the config timezone. */
  date: string;
  weekday: Weekday;
  slots: AvailabilitySlot[];
}

export interface Availability {
  timezone: string;
  durationMinutes: number;
  days: AvailabilityDay[];
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  leadId?: string;
  from?: string;
  to?: string;
  bookingType?: BookingType;
  practitionerId?: string;
  clinicalServiceId?: string;
}

/** Manual booking taken by a human from the CRM, rather than by the bot. */
export const createAppointmentFormSchema = z.object({
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().min(1, "A contact number is required"),
  scheduledAt: z.string().min(1, "Pick a slot"),
  leadId: z.string().nullable().optional(),
  staffId: z.string().nullable().optional(),
  /** Healthcare: who the appointment is with, and what it is for. */
  practitionerId: z.string().nullable().optional(),
  clinicalServiceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  /** Set when the owner picked a time the calendar does not offer. Staff-only. */
  allowOutsideAvailability: z.boolean().default(false),
});
export type CreateAppointmentFormInput = z.input<
  typeof createAppointmentFormSchema
>;
export type CreateAppointmentFormData = z.infer<
  typeof createAppointmentFormSchema
>;

/**
 * The direct-entry dialog: the appointment's own fields, typed straight in. Date and
 * time are kept apart so the dialog can pair a calendar with a clock, and are resolved
 * to an instant against the booking timezone on submit.
 */
export const quickAppointmentFormSchema = z.object({
  leadId: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().min(1, "A contact number is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a time"),
  /** Healthcare, doctor bookings — required in BOOKABLE mode, absent everywhere else. */
  practitionerId: z.string().nullable().optional(),
  clinicalServiceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * The same form, with the practitioner made mandatory where the clinic schedules by
 * doctor. The server refuses a nameless booking in that mode — it would hold the
 * shared slot key and close the instant for every practitioner at once — so the
 * dialog has to ask for one rather than letting the save fail.
 */
export function quickAppointmentSchemaFor(requiresPractitioner: boolean) {
  if (!requiresPractitioner) return quickAppointmentFormSchema;
  return quickAppointmentFormSchema.refine(
    (booking) => !!booking.practitionerId,
    {
      message: "Pick the doctor this appointment is with",
      path: ["practitionerId"],
    },
  );
}

export type QuickAppointmentFormData = z.infer<
  typeof quickAppointmentFormSchema
>;
export type QuickAppointmentFormInput = z.input<
  typeof quickAppointmentFormSchema
>;

/** Answers captured alongside a manual booking, keyed by the question's field name. */
export type ManualQualificationAnswers = Record<string, string>;

/**
 * The owner-side booking sheet. It carries three things the bot's own flow produces
 * separately: which lead this is for, what they answered, and when the call is.
 * `leadId` is required — a manual booking that skips it is invisible from the lead.
 */
export const manualBookingFormSchema = z
  .object({
    leadId: z.string().min(1, "Pick a lead or add a new one"),
    customerName: z.string().nullable().optional(),
    customerPhone: z.string().min(1, "A contact number is required"),
    answers: z.record(z.string(), z.string()).default({}),
    scheduledAt: z.string().min(1, "Pick a time"),
    isCustomTime: z.boolean().default(false),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (booking) =>
      !booking.isCustomTime ||
      new Date(booking.scheduledAt).getTime() > Date.now(),
    { message: "Pick a time in the future", path: ["scheduledAt"] },
  );

export type ManualBookingFormData = z.infer<typeof manualBookingFormSchema>;
export type ManualBookingFormInput = z.input<typeof manualBookingFormSchema>;

export type AppointmentStatusCounts = Partial<
  Record<AppointmentStatus, number>
>;
