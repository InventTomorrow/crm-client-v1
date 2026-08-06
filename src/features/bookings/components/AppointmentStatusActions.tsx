'use client';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useState } from 'react';
import { useUpdateAppointmentStatus } from '../hooks/useBookings';
import { APPOINTMENT_STATUS_LABELS, type Appointment, type AppointmentStatus } from '../types';
import { NEXT_STATUSES } from '../utils/appointmentFormat';

/** Statuses worth a confirmation step — each one tells the customer something different. */
const CONFIRMED_TRANSITIONS: Partial<Record<AppointmentStatus, string>> = {
  CANCELLED: 'This frees the slot for another lead.',
  NO_SHOW: 'Marks the lead as absent and frees the slot.',
};

export function AppointmentStatusActions({ appointment }: { appointment: Appointment }) {
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null);
  const updateStatus = useUpdateAppointmentStatus();

  const availableStatuses = NEXT_STATUSES[appointment.status];
  if (availableStatuses.length === 0) return null;

  const applyStatus = (status: AppointmentStatus) =>
    updateStatus.mutate({ appointmentId: appointment.id, status });

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {availableStatuses.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={status === 'CANCELLED' || status === 'NO_SHOW' ? 'outline' : 'default'}
            disabled={updateStatus.isPending}
            onClick={() =>
              CONFIRMED_TRANSITIONS[status]
                ? setPendingStatus(status)
                : applyStatus(status)
            }
          >
            {APPOINTMENT_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      <ConfirmDialog
        open={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        loading={updateStatus.isPending}
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
    </>
  );
}
