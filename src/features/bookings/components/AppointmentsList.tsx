'use client';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { CalendarX2, Clock, Phone, StickyNote } from 'lucide-react';
import { APPOINTMENT_STATUS_LABELS, type Appointment } from '../types';
import {
  APPOINTMENT_STATUS_ICONS,
  APPOINTMENT_STATUS_VARIANTS,
  formatSlotTime,
  groupAppointmentsByDay,
} from '../utils/appointmentFormat';
import { AppointmentStatusActions } from './AppointmentStatusActions';

interface AppointmentsListProps {
  appointments: Appointment[];
  timezone: string;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function AppointmentsList({
  appointments,
  timezone,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: AppointmentsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-mute)]">
          <CalendarX2 size={20} />
        </span>
        <p className="text-[13px] font-medium text-[var(--ink)]">No appointments here</p>
        <p className="max-w-[360px] text-[12px] text-[var(--ink-mute)]">
          Booked calls appear here as soon as the bot or your team takes a slot.
        </p>
      </div>
    );
  }

  const dayGroups = groupAppointmentsByDay(appointments, timezone);

  return (
    <div className="flex flex-col gap-5">
      {dayGroups.map((group) => (
        <div key={group.dateKey} className="flex flex-col gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
            {group.label}
          </p>

          <div className="flex flex-col gap-2">
            {group.appointments.map((appointment) => {
              const StatusIcon = APPOINTMENT_STATUS_ICONS[appointment.status];
              return (
              <article
                key={appointment.id}
                className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="shrink-0 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--ink)]">
                    {formatSlotTime(appointment.scheduledAt, timezone)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                        {appointment.customerName ?? appointment.lead?.name ?? 'Unnamed lead'}
                      </p>
                      <Badge
                        variant={APPOINTMENT_STATUS_VARIANTS[appointment.status]}
                        className="gap-1 text-[10px]"
                      >
                        <StatusIcon size={10} />
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                      </Badge>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[var(--ink-mute)]">
                      <span className="flex items-center gap-1.5">
                        <Phone size={11} />
                        {appointment.customerPhone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} />
                        {appointment.durationMinutes} min
                      </span>
                    </div>

                    {appointment.notes && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] text-[var(--ink-soft)]">
                        <StickyNote size={11} className="mt-0.5 shrink-0" />
                        <span className="min-w-0">{appointment.notes}</span>
                      </p>
                    )}

                    {appointment.cancelReason && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] text-destructive">
                        <CalendarX2 size={11} className="mt-0.5 shrink-0" />
                        <span className="min-w-0">{appointment.cancelReason}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <AppointmentStatusActions appointment={appointment} />
                </div>
              </article>
              );
            })}
          </div>
        </div>
      ))}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
