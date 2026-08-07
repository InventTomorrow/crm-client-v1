'use client';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { CalendarSync, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import {
  useAvailabilityQuery,
  useBookingConfigQuery,
  useRescheduleAppointment,
} from '../hooks/useBookings';
import type { Appointment } from '../types';
import { formatAppointmentSlot } from '../utils/appointmentFormat';
import { SlotPicker } from './SlotPicker';

const DEFAULT_TIMEZONE = 'Asia/Karachi';

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Moves a booking to another offered slot. The same picker the bot's availability
 * feeds, so a cancelled call can be put back on the calendar without the owner
 * having to rebuild it as a new booking.
 *
 * Mounted only while open, so each opening starts on a clean picker.
 */
export function RescheduleAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: RescheduleAppointmentDialogProps) {
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null);

  const { data: config } = useBookingConfigQuery();
  const { data: availability, isLoading: isLoadingAvailability } = useAvailabilityQuery(
    { days: 21 },
    { enabled: open },
  );
  const reschedule = useRescheduleAppointment();

  const timezone = availability?.timezone ?? config?.timezone ?? DEFAULT_TIMEZONE;

  const handleConfirm = () => {
    if (!selectedStartsAt) return;
    reschedule.mutate(
      {
        appointmentId: appointment.id,
        scheduledAt: selectedStartsAt,
        staffId: appointment.staffId,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!reschedule.isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[540px]">
        <DialogHeader className="flex-row items-start gap-3 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <CalendarSync size={18} />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-[15.5px] font-semibold">
              Reschedule this call
            </DialogTitle>
            <DialogDescription className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
              Currently {formatAppointmentSlot(appointment.scheduledAt, timezone)} with{' '}
              {appointment.customerName ?? appointment.lead?.name ?? 'this lead'}. Picking a
              new time frees the old slot and messages them on WhatsApp.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="border-t border-[var(--line)] px-5 py-4">
          <SlotPicker
            days={availability?.days ?? []}
            timezone={timezone}
            value={selectedStartsAt}
            onChange={setSelectedStartsAt}
            isLoading={isLoadingAvailability}
            disabled={reschedule.isPending}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] px-5 py-3.5">
          {selectedStartsAt && (
            <p className="mr-auto text-[12px] text-[var(--ink-mute)]">
              Moving to{' '}
              <span className="font-medium text-[var(--ink)]">
                {formatAppointmentSlot(selectedStartsAt, timezone)}
              </span>
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={reschedule.isPending}
            onClick={() => onOpenChange(false)}
          >
            <X size={14} className="mr-1.5" /> Close
          </Button>
          <Button
            type="button"
            disabled={!selectedStartsAt || reschedule.isPending}
            onClick={handleConfirm}
          >
            {reschedule.isPending ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <CalendarSync size={14} className="mr-1.5" />
            )}
            Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
