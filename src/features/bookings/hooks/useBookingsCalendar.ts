'use client';
import type { EventInput } from '@fullcalendar/core';
import { useMemo, useState } from 'react';
import type { Appointment } from '../types';
import { toLocalDateKey } from '../utils/appointmentFormat';
import { dayCountBetween } from '../utils/calendarGrid';
import { useAppointmentsList, useAvailabilityQuery } from './useBookings';

/** The span FullCalendar currently shows — every query is scoped to it. */
interface VisibleRange {
  start: Date;
  end: Date;
}

/** Cancelled calls no longer hold their slot, so the calendar leaves the time open. */
const OFF_CALENDAR_STATUSES = new Set<Appointment['status']>(['CANCELLED']);

function toEventEnd(appointment: Appointment): string {
  return new Date(
    new Date(appointment.scheduledAt).getTime() + appointment.durationMinutes * 60_000,
  ).toISOString();
}

/**
 * Feeds the bookings calendar: the appointments in view as events, and the still-open
 * slots behind them as background shading, so an empty patch of the grid reads as
 * bookable rather than merely blank.
 */
export function useBookingsCalendar(timezone: string) {
  const [visibleRange, setVisibleRange] = useState<VisibleRange | null>(null);

  const availability = useAvailabilityQuery(
    {
      from: visibleRange ? toLocalDateKey(visibleRange.start.toISOString(), timezone) : undefined,
      days: visibleRange ? dayCountBetween(visibleRange.start, visibleRange.end) : 7,
    },
    { enabled: visibleRange !== null },
  );

  const { appointments, isLoading: isLoadingAppointments } = useAppointmentsList(
    visibleRange
      ? { from: visibleRange.start.toISOString(), to: visibleRange.end.toISOString() }
      : {},
  );

  const events = useMemo<EventInput[]>(() => {
    const bookedEvents = appointments
      .filter((appointment) => !OFF_CALENDAR_STATUSES.has(appointment.status))
      .map((appointment) => ({
        id: appointment.id,
        title:
          appointment.customerName ?? appointment.lead?.name ?? appointment.customerPhone,
        start: appointment.scheduledAt,
        end: toEventEnd(appointment),
        classNames: [`fc-appointment--${appointment.status.toLowerCase()}`],
        extendedProps: { appointment },
      }));

    const openSlotEvents = (availability.data?.days ?? []).flatMap((day) =>
      day.slots
        .filter((slot) => slot.isAvailable)
        .map((slot) => ({
          start: slot.startsAt,
          end: slot.endsAt,
          display: 'background' as const,
          classNames: ['fc-open-slot'],
        })),
    );

    return [...openSlotEvents, ...bookedEvents];
  }, [appointments, availability.data]);

  return {
    events,
    isLoading: availability.isLoading || isLoadingAppointments,
    setVisibleRange: (start: Date, end: Date) => {
      setVisibleRange((current) =>
        current?.start.getTime() === start.getTime() && current?.end.getTime() === end.getTime()
          ? current
          : { start, end },
      );
    },
  };
}
