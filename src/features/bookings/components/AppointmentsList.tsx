'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/Badge';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { DataTable, type ColumnDef } from '@/shared/ui/DataTable';
import { APPOINTMENT_STATUS_LABELS, type Appointment } from '../types';
import {
  APPOINTMENT_STATUS_ICONS,
  APPOINTMENT_STATUS_VARIANTS,
  formatSlotTime,
  isPastAppointment,
  toLocalDateKey,
} from '../utils/appointmentFormat';
import { AppointmentDetailSheet } from './AppointmentDetailSheet';
import { AppointmentStatusActions } from './AppointmentStatusActions';

interface AppointmentsListProps {
  appointments: Appointment[];
  timezone: string;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  toolbar?: React.ReactNode;
}

/** "Today" / "Tomorrow" for the near days, otherwise "Fri, 7 Aug". */
function formatDayLabel(isoInstant: string, timezone: string): string {
  const dateKey = toLocalDateKey(isoInstant, timezone);
  const todayKey = toLocalDateKey(new Date().toISOString(), timezone);
  if (dateKey === todayKey) return 'Today';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateKey === toLocalDateKey(tomorrow.toISOString(), timezone)) return 'Tomorrow';

  const sameYear = dateKey.slice(0, 4) === todayKey.slice(0, 4);
  return new Date(isoInstant).toLocaleDateString('en-GB', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function AppointmentsList({
  appointments,
  timezone,
  isLoading,
  toolbar,
}: AppointmentsListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const columns: ColumnDef<Appointment, unknown>[] = useMemo(
    () => [
      {
        id: 'scheduledAt',
        accessorFn: (appointment) => appointment.scheduledAt,
        header: 'When',
        enableSorting: true,
        cell: ({ row }) => {
          const appointment = row.original;
          const isPast = isPastAppointment(appointment);
          const dayLabel = formatDayLabel(appointment.scheduledAt, timezone);
          const isNearDay = dayLabel === 'Today' || dayLabel === 'Tomorrow';

          return (
            <div className={cn('flex flex-col gap-0.5', isPast && 'opacity-55')}>
              <span className="text-[13px] font-semibold tabular-nums leading-tight text-[var(--ink)]">
                {formatSlotTime(appointment.scheduledAt, timezone)}
                <span className="ml-1.5 text-[11px] font-normal text-[var(--ink-mute)]">
                  {appointment.durationMinutes} min
                </span>
              </span>
              <span
                className={cn(
                  'text-[11.5px] leading-tight',
                  isNearDay && !isPast
                    ? 'font-medium text-[var(--accent)]'
                    : 'text-[var(--ink-mute)]',
                )}
              >
                {dayLabel}
              </span>
            </div>
          );
        },
      },
      {
        id: 'customer',
        accessorFn: (appointment) =>
          appointment.customerName ?? appointment.lead?.name ?? appointment.customerPhone,
        header: 'Customer',
        enableSorting: true,
        cell: ({ row }) => {
          const appointment = row.original;
          const name = appointment.customerName ?? appointment.lead?.name;

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <CRMAvatar name={name ?? appointment.customerPhone} size={30} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-medium leading-tight text-[var(--ink)]">
                  {name ?? appointment.customerPhone}
                </span>
                <span className="truncate text-[11.5px] leading-tight text-[var(--ink-mute)]">
                  {name ? appointment.customerPhone : 'No name on file'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'status',
        accessorFn: (appointment) => APPOINTMENT_STATUS_LABELS[appointment.status],
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => {
          const appointment = row.original;
          const StatusIcon = APPOINTMENT_STATUS_ICONS[appointment.status];
          return (
            <Badge
              variant={APPOINTMENT_STATUS_VARIANTS[appointment.status]}
              className="gap-1 whitespace-nowrap text-[10px]"
            >
              <StatusIcon size={10} />
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </Badge>
          );
        },
      },
      {
        id: 'notes',
        accessorFn: (appointment) => appointment.notes || appointment.cancelReason || '',
        header: 'Notes',
        enableSorting: false,
        cell: ({ row }) => {
          const appointment = row.original;
          if (appointment.cancelReason) {
            return (
              <p className="max-w-[260px] truncate text-[12px] text-[var(--ink-mute)]">
                <span className="font-medium text-destructive">Cancelled — </span>
                {appointment.cancelReason}
              </p>
            );
          }
          if (appointment.notes) {
            return (
              <p className="max-w-[260px] truncate text-[12px] text-[var(--ink-soft)]">
                {appointment.notes}
              </p>
            );
          }
          return <span className="text-[12px] text-[var(--ink-mute)]/60">—</span>;
        },
      },
      {
        id: '__actions',
        // Fixed pixel size — tanstack-table won't ever auto-resize it
        size: 110,
        minSize: 110,
        maxSize: 110,
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          // Stop the row-click handler from also triggering when an action button is clicked
          <div className="flex justify-end pr-1" onClick={(e) => e.stopPropagation()}>
            <AppointmentStatusActions appointment={row.original} />
          </div>
        ),
      },
    ],
    [timezone],
  );

  return (
    <>
      <DataTable
        data={appointments}
        columns={columns}
        isLoading={isLoading}
        toolbar={toolbar}
        emptyMessage="No appointments found."
        defaultPageSize={20}
        onRowClick={(appointment) => setSelectedAppointment(appointment)}
      />

      <AppointmentDetailSheet
        appointment={selectedAppointment}
        timezone={timezone}
        open={selectedAppointment !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedAppointment(null);
        }}
      />
    </>
  );
}
