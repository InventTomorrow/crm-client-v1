import {
  CalendarCheck,
  CalendarSync,
  CalendarX2,
  CheckCircle2,
  Hourglass,
  type LucideIcon,
} from 'lucide-react';
import type {
  Appointment,
  AppointmentStatus,
  BookingConfig,
  BookingWindow,
  SlotUnavailableReason,
  Weekday,
} from '../types';
import { minutesBetween, WEEKDAY_LABELS } from '../types';

/** Badge tone per status — cancelled reads as a failure, completed as done. */
export const APPOINTMENT_STATUS_VARIANTS: Record<
  AppointmentStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  PENDING: 'outline',
  CONFIRMED: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  RESCHEDULED: 'outline',
};

/** Icon per status, used on both the badge and the button that sets it. */
export const APPOINTMENT_STATUS_ICONS: Record<AppointmentStatus, LucideIcon> = {
  PENDING: Hourglass,
  CONFIRMED: CalendarCheck,
  COMPLETED: CheckCircle2,
  CANCELLED: CalendarX2,
  RESCHEDULED: CalendarSync,
};

/**
 * Statuses a booking can still move to. Rescheduling is missing on purpose — it is
 * not a status flip but a new time, so it opens the slot picker instead.
 */
export const NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  RESCHEDULED: ['CONFIRMED', 'CANCELLED'],
};

/** Transitions worth a confirmation step, keyed to the copy explaining them. */
export const CONFIRMED_TRANSITIONS: Partial<Record<AppointmentStatus, string>> = {
  COMPLETED: 'Marks the call as done and frees the slot for another lead.',
};

/**
 * A call that already happened cannot be moved; everything else can, including a
 * cancelled one — putting it back on the calendar is how the owner un-cancels.
 */
export function isReschedulable(appointment: Appointment): boolean {
  return appointment.status !== 'COMPLETED';
}

export const SLOT_UNAVAILABLE_LABELS: Record<SlotUnavailableReason, string> = {
  BOOKED: 'Already booked',
  TOO_SOON: 'Too soon to book',
  DAY_FULL: 'Day is full',
};

/** Time-of-day in the workspace's booking timezone, e.g. "2:30 PM". */
export function formatSlotTime(isoInstant: string, timezone: string): string {
  return new Date(isoInstant).toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Full date in the workspace's booking timezone, e.g. "Mon, 10 Aug 2026". */
export function formatSlotDate(isoInstant: string, timezone: string): string {
  return new Date(isoInstant).toLocaleDateString('en-GB', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "Mon, 10 Aug 2026 · 2:30 PM" — the one-line form used in lists. */
export function formatAppointmentSlot(isoInstant: string, timezone: string): string {
  return `${formatSlotDate(isoInstant, timezone)} · ${formatSlotTime(isoInstant, timezone)}`;
}

/** Local "YYYY-MM-DD" key for a day heading, in the booking timezone. */
export function toLocalDateKey(isoInstant: string, timezone: string): string {
  // en-CA formats as YYYY-MM-DD, which sorts lexically.
  return new Date(isoInstant).toLocaleDateString('en-CA', { timeZone: timezone });
}

export function isPastAppointment(appointment: Appointment): boolean {
  return new Date(appointment.scheduledAt).getTime() < Date.now();
}

export interface AppointmentDayGroup {
  dateKey: string;
  label: string;
  appointments: Appointment[];
}

/** Groups a flat appointment list into day sections for the list view. */
export function groupAppointmentsByDay(
  appointments: Appointment[],
  timezone: string,
): AppointmentDayGroup[] {
  const byDay = new Map<string, Appointment[]>();

  for (const appointment of appointments) {
    const dateKey = toLocalDateKey(appointment.scheduledAt, timezone);
    const existing = byDay.get(dateKey);
    if (existing) existing.push(appointment);
    else byDay.set(dateKey, [appointment]);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, dayAppointments]) => ({
      dateKey,
      label: formatSlotDate(dayAppointments[0]!.scheduledAt, timezone),
      appointments: dayAppointments,
    }));
}

/** "Mon–Fri" style summary of the configured days, in week order. */
export function describeAvailableDays(availableDays: Weekday[]): string {
  const ordered: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const selected = ordered.filter((day) => availableDays.includes(day));
  if (selected.length === 0) return 'No days selected';
  if (selected.length === 7) return 'Every day';
  return selected.map((day) => WEEKDAY_LABELS[day]).join(', ');
}

/**
 * How many slots a window yields — the same walk the server does, so the editor
 * previews exactly what will be offered rather than an estimate.
 */
export function countWindowSlots(
  window: BookingWindow,
  durationMinutes: number,
  bufferMinutes: number,
): number {
  const span = minutesBetween(window.startTime, window.endTime);
  const step = durationMinutes + bufferMinutes;
  if (span < durationMinutes || step <= 0) return 0;
  return Math.floor((span - durationMinutes) / step) + 1;
}

/** "6 slots of 30 min" — the preview under each window row. */
export function describeWindowSlots(
  window: BookingWindow,
  durationMinutes: number,
  bufferMinutes: number,
): string {
  const count = countWindowSlots(window, durationMinutes, bufferMinutes);
  if (count === 0) return 'No slots fit in this window';
  return `${count} slot${count === 1 ? '' : 's'} of ${durationMinutes} min`;
}

/** How many bookable slots the config exposes in a normal week. */
export function countWeeklySlots(
  config: Pick<
    BookingConfig,
    'availableDays' | 'workingHours' | 'durationMinutes' | 'bufferMinutes'
  >,
): number {
  const perDay = config.workingHours.reduce(
    (total, window) =>
      total + countWindowSlots(window, config.durationMinutes, config.bufferMinutes),
    0,
  );
  return config.availableDays.length * perDay;
}

/** A config is only usable once it has both days and hours to offer. */
export function isBookingConfigured(config: BookingConfig | null | undefined): boolean {
  return !!config && config.availableDays.length > 0 && config.workingHours.length > 0;
}

/** Milliseconds to add to a UTC instant to read it as wall-clock in `timezone`. */
function zoneOffsetMs(instant: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  // `hour: '2-digit'` with hour12:false reads midnight as 24 in some engines.
  const asIfUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour') % 24,
    read('minute'),
    read('second'),
  );
  return asIfUtc - instant.getTime();
}

/**
 * Resolves a `datetime-local` value ("2026-08-11T16:00") typed against the workspace's
 * booking timezone into the absolute instant the API stores. Mirrors the server's
 * `toUtcInstant`: the offset is applied twice because it depends on the instant itself,
 * which matters on the days a zone shifts.
 */
export function localInputToIso(localDateTime: string, timezone: string): string {
  const naive = new Date(`${localDateTime}:00Z`);
  if (Number.isNaN(naive.getTime())) return '';
  const firstPass = new Date(naive.getTime() - zoneOffsetMs(naive, timezone));
  return new Date(naive.getTime() - zoneOffsetMs(firstPass, timezone)).toISOString();
}

/** The inverse — an instant rendered as the `datetime-local` value for `timezone`. */
export function isoToLocalInput(isoInstant: string, timezone: string): string {
  if (!isoInstant) return '';
  const instant = new Date(isoInstant);
  if (Number.isNaN(instant.getTime())) return '';
  return new Date(instant.getTime() + zoneOffsetMs(instant, timezone))
    .toISOString()
    .slice(0, 16);
}
