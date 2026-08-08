'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  quickAppointmentFormSchema,
  type QuickAppointmentFormData,
  type QuickAppointmentFormInput,
} from '../types';
import { isoToLocalInput, localInputToIso, toLocalDateKey } from '../utils/appointmentFormat';
import { useCreateAppointment } from './useBookings';

interface UseQuickAppointmentFormOptions {
  isOpen: boolean;
  timezone: string;
  /** ISO instant to open on — set when the dialog was opened from a calendar slot. */
  initialScheduledAt?: string | null;
  onBooked: () => void;
}

const EMPTY_QUICK_BOOKING: QuickAppointmentFormInput = {
  leadId: null,
  customerName: '',
  customerPhone: '',
  date: '',
  time: '',
  notes: '',
};

/**
 * Owns the direct-entry dialog. Unlike the guided sheet it books whatever instant was
 * typed — availability is not enforced, because this is the path for a call the owner
 * already agreed, or one that lands outside the published calendar on purpose.
 */
export function useQuickAppointmentForm(options: UseQuickAppointmentFormOptions) {
  const form = useForm<QuickAppointmentFormInput, unknown, QuickAppointmentFormData>({
    resolver: zodResolver(quickAppointmentFormSchema),
    defaultValues: EMPTY_QUICK_BOOKING,
  });

  // Each opening starts fresh, seeded with the slot the calendar was clicked on.
  useEffect(() => {
    if (!options.isOpen) return;
    const localDateTime = options.initialScheduledAt
      ? isoToLocalInput(options.initialScheduledAt, options.timezone)
      : '';
    form.reset({
      ...EMPTY_QUICK_BOOKING,
      date: localDateTime.slice(0, 10) || toLocalDateKey(new Date().toISOString(), options.timezone),
      time: localDateTime.slice(11, 16),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.isOpen, options.initialScheduledAt, options.timezone]);

  const createAppointment = useCreateAppointment();

  const handleSubmit = form.handleSubmit((quickBooking) => {
    createAppointment.mutate(
      {
        leadId: quickBooking.leadId || null,
        customerName: quickBooking.customerName?.trim() || null,
        customerPhone: quickBooking.customerPhone.trim(),
        scheduledAt: localInputToIso(
          `${quickBooking.date}T${quickBooking.time}`,
          options.timezone,
        ),
        staffId: null,
        notes: quickBooking.notes?.trim() || null,
        allowOutsideAvailability: true,
      },
      {
        onSuccess: () => {
          form.reset(EMPTY_QUICK_BOOKING);
          options.onBooked();
        },
      },
    );
  });

  const selectLead = (lead: { id: string; name: string; phone?: string }) => {
    form.setValue('leadId', lead.id, { shouldValidate: true });
    form.setValue('customerName', lead.name);
    form.setValue('customerPhone', lead.phone ?? '', { shouldValidate: true });
  };

  const clearLead = () => {
    form.setValue('leadId', null);
    form.setValue('customerName', '');
    form.setValue('customerPhone', '', { shouldValidate: false });
  };

  return {
    form,
    isBooking: createAppointment.isPending,
    handleSubmit,
    selectLead,
    clearLead,
  };
}
