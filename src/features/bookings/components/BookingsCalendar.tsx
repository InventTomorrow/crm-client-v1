'use client';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import luxonPlugin from '@fullcalendar/luxon3';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { cn } from '@/lib/utils';
import { Spinner } from '@/shared/ui/Spinner';
import { useState } from 'react';
import { useBookingsCalendar } from '../hooks/useBookingsCalendar';
import type { Appointment, BookingWindow } from '../types';
import { APPOINTMENT_STATUS_LABELS } from '../types';
import { APPOINTMENT_STATUS_ICONS } from '../utils/appointmentFormat';
import { deriveCalendarTimeBounds, toSlotDuration } from '../utils/calendarGrid';
import { AppointmentDetailSheet } from './AppointmentDetailSheet';

interface BookingsCalendarProps {
  timezone: string;
  durationMinutes: number;
  workingHours: BookingWindow[];
  /** Opens the direct-entry dialog on the picked instant. */
  onCreateAtSlot: (startsAt: string) => void;
}

/** What the colours on the grid mean — the calendar has no room to label them inline. */
const LEGEND_ITEMS: { label: string; swatchClassName: string }[] = [
  { label: 'Open slot', swatchClassName: 'bg-[var(--accent-soft)] border border-[var(--accent)]' },
  { label: APPOINTMENT_STATUS_LABELS.PENDING, swatchClassName: 'bg-[var(--warning)]' },
  { label: APPOINTMENT_STATUS_LABELS.CONFIRMED, swatchClassName: 'bg-[var(--accent)]' },
  { label: APPOINTMENT_STATUS_LABELS.COMPLETED, swatchClassName: 'bg-[var(--ink-mute)]' },
];

/**
 * Event body: status icon plus who the call is with, kept to one line in a slot.
 * Deliberately not a component — FullCalendar *calls* the content generator rather
 * than mounting it, so anything hook-shaped (including the React Compiler's memo
 * cache) would run outside a renderer and throw.
 */
function renderAppointmentEvent({ event, timeText }: EventContentArg) {
  const appointment = event.extendedProps.appointment as Appointment;
  const StatusIcon = APPOINTMENT_STATUS_ICONS[appointment.status];

  return (
    <div className="flex min-w-0 items-center gap-1 px-1 py-0.5">
      <StatusIcon size={10} className="shrink-0" />
      <span className="truncate text-[11px] font-medium">{event.title}</span>
      <span className="ml-auto hidden shrink-0 text-[10px] opacity-80 sm:inline">
        {timeText}
      </span>
    </div>
  );
}

/**
 * The week the bookings actually live in. Open slots are shaded, so dragging or clicking
 * an empty patch of the grid books the exact time it belongs to, and an existing call
 * opens its detail sheet.
 */
export function BookingsCalendar({
  timezone,
  durationMinutes,
  workingHours,
  onCreateAtSlot,
}: BookingsCalendarProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { events, isLoading, setVisibleRange } = useBookingsCalendar(timezone);

  const { slotMinTime, slotMaxTime } = deriveCalendarTimeBounds(workingHours);

  const openAppointment = (clickInfo: EventClickArg) => {
    const appointment = clickInfo.event.extendedProps.appointment as Appointment | undefined;
    if (appointment) setSelectedAppointment(appointment);
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
      {isLoading && (
        <span className="absolute right-4 top-4 z-10 flex items-center gap-1.5 text-[11px] text-[var(--ink-mute)]">
          <Spinner className="size-3" /> Loading
        </span>
      )}

      <div className="bookings-calendar">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, luxonPlugin]}
          timeZone={timezone}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth',
          }}
          buttonText={{ today: 'Today', day: 'Day', week: 'Week', month: 'Month' }}
          height="auto"
          firstDay={1}
          allDaySlot={false}
          nowIndicator
          expandRows
          stickyHeaderDates
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
          slotDuration={toSlotDuration(durationMinutes)}
          slotLabelFormat={{ hour: 'numeric', minute: '2-digit', omitZeroMinute: true }}
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
          dayMaxEvents={3}
          selectable
          selectMirror
          selectOverlap={false}
          select={(selection) => onCreateAtSlot(selection.start.toISOString())}
          events={events}
          eventContent={renderAppointmentEvent}
          eventClick={openAppointment}
          datesSet={(range) => setVisibleRange(range.start, range.end)}
          noEventsText="Nothing booked in this range"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--line)] pt-2 text-[11px] text-[var(--ink-mute)]">
        <span>Times in {timezone.replace('_', ' ')} · click an open slot to book it</span>
        <span className="ml-auto flex flex-wrap items-center gap-3">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-full', item.swatchClassName)} />
              {item.label}
            </span>
          ))}
        </span>
      </div>

      <AppointmentDetailSheet
        appointment={selectedAppointment}
        timezone={timezone}
        open={selectedAppointment !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedAppointment(null);
        }}
      />
    </section>
  );
}
