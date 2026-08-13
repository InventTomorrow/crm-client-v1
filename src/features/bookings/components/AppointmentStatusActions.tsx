'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { CalendarSync, CalendarX2, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteAppointment, useUpdateAppointmentStatus } from '../hooks/useBookings';
import {
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
  type AppointmentStatus,
} from '../types';
import {
  APPOINTMENT_STATUS_ICONS,
  CONFIRMED_TRANSITIONS,
  isReschedulable,
  NEXT_STATUSES,
} from '../utils/appointmentFormat';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog';

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

/** One row action, rendered either as an icon button (sheet) or a menu item (table). */
interface AppointmentAction {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isDestructive?: boolean;
  run: () => void;
}

export function AppointmentStatusActions({
  appointment,
  wrap = false,
  layout = 'buttons',
}: {
  appointment: Appointment;
  /** Allow wrapping (e.g. in the detail sheet footer). Default false keeps table column tight. */
  wrap?: boolean;
  /** `menu` collapses the actions behind a ⋮ trigger — how table rows show them. */
  layout?: 'buttons' | 'menu';
}) {
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateStatus = useUpdateAppointmentStatus();
  const deleteAppointment = useDeleteAppointment();

  // In a table row the status column owns the transitions, so the menu carries
  // only what that cell can't do — no duplicate "Mark confirmed" in both places.
  const isMenu = layout === 'menu';
  const nextStatuses = isMenu
    ? []
    : NEXT_STATUSES[appointment.status].filter((s) => s !== 'CANCELLED');
  const canCancel     = !isMenu && NEXT_STATUSES[appointment.status].includes('CANCELLED');
  const canReschedule = isReschedulable(appointment);

  if (nextStatuses.length === 0 && !canCancel && !canReschedule && !isMenu) return null;

  const actions: AppointmentAction[] = [
    ...nextStatuses.map((status) => ({
      key: status,
      label: APPOINTMENT_STATUS_LABELS[status],
      icon: APPOINTMENT_STATUS_ICONS[status],
      run: () =>
        CONFIRMED_TRANSITIONS[status]
          ? setPendingStatus(status)
          : updateStatus.mutate({ appointmentId: appointment.id, status }),
    })),
    ...(canReschedule
      ? [
          {
            key: 'reschedule',
            label: 'Reschedule',
            icon: CalendarSync,
            run: () => setIsRescheduleOpen(true),
          },
        ]
      : []),
    ...(canCancel
      ? [
          {
            key: 'cancel',
            label: 'Cancel',
            icon: CalendarX2,
            isDestructive: true,
            run: () => setIsCancelOpen(true),
          },
        ]
      : []),
    ...(isMenu
      ? [
          {
            key: 'delete',
            label: 'Delete',
            icon: Trash2,
            isDestructive: true,
            run: () => setIsDeleteOpen(true),
          },
        ]
      : []),
  ];

  return (
    <>
      {layout === 'menu' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Appointment actions"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {actions.map(({ key, label, icon: ActionIcon, isDestructive, run }) => (
              <DropdownMenuItem
                key={key}
                variant={isDestructive ? 'destructive' : 'default'}
                disabled={updateStatus.isPending || deleteAppointment.isPending}
                onSelect={run}
              >
                <ActionIcon size={13} /> {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className={cn('flex items-center gap-1', wrap && 'flex-wrap')}>
          {actions.map(({ key, label, icon: ActionIcon, isDestructive, run }) => (
            <ActionIconBtn
              key={key}
              label={label}
              icon={ActionIcon}
              variant={isDestructive ? 'danger' : 'default'}
              disabled={updateStatus.isPending}
              onClick={run}
            />
          ))}
        </div>
      )}

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

      <ConfirmDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        loading={deleteAppointment.isPending}
        title="Delete this appointment?"
        description="The booking is removed from the calendar for good. The customer is not notified — cancel it instead if they should hear about it."
        confirmLabel="Delete"
        onConfirm={() =>
          deleteAppointment.mutate(appointment.id, {
            onSuccess: () => setIsDeleteOpen(false),
          })
        }
      />
    </>
  );
}
