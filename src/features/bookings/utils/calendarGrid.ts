import type { BookingWindow } from '../types';

/** Widest slice of the day the calendar has to render, as FullCalendar time strings. */
export interface CalendarTimeBounds {
  slotMinTime: string;
  slotMaxTime: string;
}

const FULL_DAY_BOUNDS: CalendarTimeBounds = { slotMinTime: '00:00:00', slotMaxTime: '24:00:00' };

function toHour(localTime: string): number {
  return Number(localTime.split(':')[0] ?? 0) + (Number(localTime.split(':')[1] ?? 0) > 0 ? 1 : 0);
}

/**
 * Trims the week grid to the hours the workspace actually books, padded to whole hours,
 * so a 10–6 calendar does not render as a mostly-empty 24-hour column.
 */
export function deriveCalendarTimeBounds(workingHours: BookingWindow[]): CalendarTimeBounds {
  if (workingHours.length === 0) return FULL_DAY_BOUNDS;

  const earliestHour = Math.min(
    ...workingHours.map((window) => Number(window.startTime.split(':')[0] ?? 0)),
  );
  const latestHour = Math.max(...workingHours.map((window) => toHour(window.endTime)));

  // An hour of headroom each side keeps off-grid bookings from sitting on the edge.
  const startHour = Math.max(0, earliestHour - 1);
  const endHour = Math.min(24, latestHour + 1);

  return {
    slotMinTime: `${String(startHour).padStart(2, '0')}:00:00`,
    slotMaxTime: `${String(endHour).padStart(2, '0')}:00:00`,
  };
}

/** Meeting length as the "HH:MM:SS" row height FullCalendar expects. */
export function toSlotDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

/** Whole days between two dates, used to size the availability request for a visible range. */
export function dayCountBetween(start: Date, end: Date): number {
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.min(60, Math.max(1, days));
}
