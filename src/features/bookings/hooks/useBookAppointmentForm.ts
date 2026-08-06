'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAvailabilityQuery, useCreateAppointment } from './useBookings';
import {
  createAppointmentFormSchema,
  type CreateAppointmentFormData,
  type CreateAppointmentFormInput,
} from '../types';

const AVAILABILITY_WINDOW_DAYS = 14;

const EMPTY_BOOKING: CreateAppointmentFormInput = {
  customerName: '',
  customerPhone: '',
  scheduledAt: '',
  leadId: null,
  staffId: null,
  notes: '',
};

/**
 * Owns the manual-booking dialog: pulls the same computed availability the bot
 * uses, and books the picked instant. `onBooked` fires only after the write
 * lands so the dialog can close without racing the request.
 */
export function useBookAppointmentForm(options: { isOpen: boolean; onBooked: () => void }) {
  const form = useForm<CreateAppointmentFormInput, unknown, CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentFormSchema),
    defaultValues: EMPTY_BOOKING,
  });

  // Only fetch while the dialog is open — availability is short-lived data.
  const availability = useAvailabilityQuery(
    { days: AVAILABILITY_WINDOW_DAYS },
    { enabled: options.isOpen },
  );

  const createAppointment = useCreateAppointment();

  const handleSubmit = form.handleSubmit((formData) => {
    createAppointment.mutate(
      {
        ...formData,
        customerName: formData.customerName?.trim() || null,
        notes: formData.notes?.trim() || null,
      },
      {
        onSuccess: () => {
          form.reset(EMPTY_BOOKING);
          options.onBooked();
        },
      },
    );
  });

  return {
    form,
    availability: availability.data,
    isLoadingAvailability: availability.isLoading,
    isBooking: createAppointment.isPending,
    handleSubmit,
    resetForm: () => form.reset(EMPTY_BOOKING),
  };
}
