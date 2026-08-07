'use client';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { Label } from '@/shared/ui/Label';
import { Textarea } from '@/shared/ui/Textarea';
import { CalendarX2, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useUpdateAppointmentStatus } from '../hooks/useBookings';
import type { Appointment } from '../types';

const MAX_REASON_LENGTH = 200;

interface CancelAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Cancelling is the workspace's call, never the customer's — the bot has no tool
 * for it. The reason is optional but goes out with the WhatsApp message, so it is
 * worth asking for while the owner still remembers why.
 *
 * Mounted only while open, so each opening starts on an empty reason.
 */
export function CancelAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: CancelAppointmentDialogProps) {
  const [cancelReason, setCancelReason] = useState('');
  const updateStatus = useUpdateAppointmentStatus();

  const handleConfirm = () =>
    updateStatus.mutate(
      {
        appointmentId: appointment.id,
        status: 'CANCELLED',
        cancelReason: cancelReason.trim() || null,
      },
      { onSuccess: () => onOpenChange(false) },
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!updateStatus.isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[440px]">
        <DialogHeader className="flex-row items-start gap-3 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
            <CalendarX2 size={18} />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-[15.5px] font-semibold">
              Cancel this call?
            </DialogTitle>
            <DialogDescription className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
              The slot reopens for other leads and the customer is told on WhatsApp. You
              can put it back on the calendar afterwards by rescheduling it.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 border-t border-[var(--line)] px-5 py-4">
          <Label htmlFor="cancel-reason">Reason (optional)</Label>
          <Textarea
            id="cancel-reason"
            rows={3}
            maxLength={MAX_REASON_LENGTH}
            placeholder="e.g. Something came up on our side — we'll rebook you."
            disabled={updateStatus.isPending}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
          <p className="text-[11px] text-[var(--ink-mute)]">
            Sent to the customer with the cancellation.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--line)] px-5 py-3.5">
          <Button
            type="button"
            variant="outline"
            disabled={updateStatus.isPending}
            onClick={() => onOpenChange(false)}
          >
            <X size={14} className="mr-1.5" /> Keep it
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={updateStatus.isPending}
            onClick={handleConfirm}
          >
            {updateStatus.isPending ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <CalendarX2 size={14} className="mr-1.5" />
            )}
            Cancel call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
