'use client';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { CalendarSync, CalendarX2 } from 'lucide-react';
import { useState } from 'react';
import { useUpdateAppointmentStatus } from '../hooks/useBookings';
import { APPOINTMENT_STATUS_LABELS, type Appointment, type AppointmentStatus } from '../types';
import {
  APPOINTMENT_STATUS_ICONS,
  isReschedulable,
  NEXT_STATUSES,
} from '../utils/appointmentFormat';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog';

/** Statuses worth a confirmation step. Cancelling has its own dialog — it collects a reason. */
const CONFIRMED_TRANSITIONS: Partial<Record<AppointmentStatus, string>> = {
  COMPLETED: 'Marks the call as done and frees the slot for another lead.',
};

export function AppointmentStatusActions({ appointment }: { appointment: Appointment }) {
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const updateStatus = useUpdateAppointmentStatus();

  // Cancelling is a status change like any other, but it owns a dialog rather than a
  // plain button, so it is pulled out of the row here.
  const statusButtons = NEXT_STATUSES[appointment.status].filter(
    (status) => status !== 'CANCELLED',
  );
  const canCancel = NEXT_STATUSES[appointment.status].includes('CANCELLED');
  const canReschedule = isReschedulable(appointment);

  if (statusButtons.length === 0 && !canCancel && !canReschedule) return null;

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {statusButtons.map((status) => {
          const StatusIcon = APPOINTMENT_STATUS_ICONS[status];
          return (
            <Button
              key={status}
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() =>
                CONFIRMED_TRANSITIONS[status]
                  ? setPendingStatus(status)
                  : updateStatus.mutate({ appointmentId: appointment.id, status })
              }
            >
              <StatusIcon size={13} className="mr-1.5" />
              {APPOINTMENT_STATUS_LABELS[status]}
            </Button>
          );
        })}

        {canReschedule && (
          <Button
            size="sm"
            variant="outline"
            disabled={updateStatus.isPending}
            onClick={() => setIsRescheduleOpen(true)}
          >
            <CalendarSync size={13} className="mr-1.5" /> Reschedule
          </Button>
        )}

        {canCancel && (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={updateStatus.isPending}
            onClick={() => setIsCancelOpen(true)}
          >
            <CalendarX2 size={13} className="mr-1.5" /> Cancel
          </Button>
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

      {/* Mounted on demand so each dialog opens with fresh state rather than the last pick. */}
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
