'use client';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { CalendarSync, CalendarX2 } from 'lucide-react';
import { useState } from 'react';
import { useUpdateAppointmentStatus } from '../hooks/useBookings';
import {
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
  type AppointmentStatus,
} from '../types';
import {
  APPOINTMENT_STATUS_ICONS,
  isReschedulable,
  NEXT_STATUSES,
} from '../utils/appointmentFormat';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog';

/** Statuses worth a confirmation step. */
const CONFIRMED_TRANSITIONS: Partial<Record<AppointmentStatus, string>> = {
  COMPLETED: 'Marks the call as done and frees the slot for another lead.',
};

/**
 * Fixed-size icon button. The label floats *above* via position:absolute so
 * it never changes the button's own dimensions → zero table-column reflow.
 *
 * `variant` controls hover colour:
 *   - default  → subtle ink tint
 *   - danger   → destructive tint
 */
function ActionIconBtn({
  label,
  icon: Icon,
  disabled,
  onClick,
  variant = 'default',
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  return (
    // `relative` is on the outer span so the absolute label doesn't escape
    <span className="relative inline-flex">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        className={cn(
          'peer', // lets the label react to button:hover via CSS sibling
          // Fixed shape — matches HeaderIconButton language
          'inline-flex items-center justify-center',
          'size-[28px] rounded-md',
          'bg-[var(--surface-2)] text-[var(--ink-mute)]',
          // Colour-only transition — never layout
          'transition-colors duration-150',
          variant === 'danger'
            ? 'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400'
            : 'hover:bg-[var(--surface-2)] hover:text-[var(--ink)] hover:ring-1 hover:ring-[var(--line)]',
          'disabled:pointer-events-none disabled:opacity-35',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
        )}
      >
        <Icon size={13} />
      </button>

      {/*
        Floating label — absolutely positioned above, opacity transition only.
        Uses `peer-hover:opacity-100` so it responds to the button's hover
        without wrapping the button inside itself (avoids z-index stacking).
      */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute bottom-[calc(100%+5px)] left-1/2 -translate-x-1/2',
          'whitespace-nowrap rounded border border-[var(--line)]',
          'bg-[var(--bg)] px-1.5 py-0.5',
          'text-[10px] font-medium text-[var(--ink-soft)]',
          'opacity-0 transition-opacity duration-150',
          'peer-hover:opacity-100',
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function AppointmentStatusActions({
  appointment,
  wrap = false,
}: {
  appointment: Appointment;
  /** Allow wrapping (e.g. in the detail sheet footer). Default false keeps table column tight. */
  wrap?: boolean;
}) {
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const updateStatus = useUpdateAppointmentStatus();

  const statusButtons = NEXT_STATUSES[appointment.status].filter(
    (s) => s !== 'CANCELLED',
  );
  const canCancel     = NEXT_STATUSES[appointment.status].includes('CANCELLED');
  const canReschedule = isReschedulable(appointment);

  if (statusButtons.length === 0 && !canCancel && !canReschedule) return null;

  return (
    <>
      <div className={cn('flex items-center gap-1', wrap && 'flex-wrap')}>
        {statusButtons.map((status) => {
          const StatusIcon = APPOINTMENT_STATUS_ICONS[status];
          return (
            <ActionIconBtn
              key={status}
              label={APPOINTMENT_STATUS_LABELS[status]}
              icon={StatusIcon}
              disabled={updateStatus.isPending}
              onClick={() =>
                CONFIRMED_TRANSITIONS[status]
                  ? setPendingStatus(status)
                  : updateStatus.mutate({ appointmentId: appointment.id, status })
              }
            />
          );
        })}

        {canReschedule && (
          <ActionIconBtn
            label="Reschedule"
            icon={CalendarSync}
            disabled={updateStatus.isPending}
            onClick={() => setIsRescheduleOpen(true)}
          />
        )}

        {canCancel && (
          <ActionIconBtn
            label="Cancel"
            icon={CalendarX2}
            variant="danger"
            disabled={updateStatus.isPending}
            onClick={() => setIsCancelOpen(true)}
          />
        )}
      </div>

      <ConfirmDialog
        open={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        loading={updateStatus.isPending}
        destructive={false}
        title={
          pendingStatus
            ? `Mark as ${APPOINTMENT_STATUS_LABELS[pendingStatus].toLowerCase()}?`
            : ''
        }
        description={pendingStatus ? CONFIRMED_TRANSITIONS[pendingStatus] : undefined}
        confirmLabel={pendingStatus ? APPOINTMENT_STATUS_LABELS[pendingStatus] : 'Confirm'}
        onConfirm={() => {
          if (!pendingStatus) return;
          updateStatus.mutate(
            { appointmentId: appointment.id, status: pendingStatus },
            { onSuccess: () => setPendingStatus(null) },
          );
        }}
      />

      {isRescheduleOpen && (
        <RescheduleAppointmentDialog
          appointment={appointment}
          open
          onOpenChange={setIsRescheduleOpen}
        />
      )}

      {isCancelOpen && (
        <CancelAppointmentDialog
          appointment={appointment}
          open
          onOpenChange={setIsCancelOpen}
        />
      )}
    </>
  );
}
