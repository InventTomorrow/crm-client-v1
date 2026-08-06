'use client';
import {
  useLeadQualificationQuery,
  useQualificationFormQuery,
  useRecordQualificationAnswers,
} from '@/features/qualification/hooks/useQualification';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  manualBookingFormSchema,
  type ManualBookingFormData,
  type ManualBookingFormInput,
} from '../types';
import { useAvailabilityQuery, useBookingConfigQuery, useCreateAppointment } from './useBookings';

const AVAILABILITY_WINDOW_DAYS = 14;

const EMPTY_BOOKING: ManualBookingFormInput = {
  leadId: '',
  customerName: '',
  customerPhone: '',
  answers: {},
  scheduledAt: '',
  isCustomTime: false,
  notes: '',
};

/**
 * Owns the owner-side booking sheet. It runs the same three stages the bot runs across a
 * conversation — identify the lead, capture what they answered, take a real slot — but in
 * one pass, because the owner already had the conversation on the phone.
 */
export function useManualBookingForm(options: { isOpen: boolean; onBooked: () => void }) {
  const form = useForm<ManualBookingFormInput, unknown, ManualBookingFormData>({
    resolver: zodResolver(manualBookingFormSchema),
    defaultValues: EMPTY_BOOKING,
  });

  const selectedLeadId = useWatch({ control: form.control, name: 'leadId' });

  const { data: config } = useBookingConfigQuery();
  const { data: qualificationForm } = useQualificationFormQuery();

  // Availability is short-lived, so it is only fetched while the sheet is open.
  const availability = useAvailabilityQuery(
    { days: AVAILABILITY_WINDOW_DAYS },
    { enabled: options.isOpen },
  );

  const leadQualification = useLeadQualificationQuery(selectedLeadId || null);

  // Prefill whatever this lead already told the bot, so the owner tops up the gaps
  // rather than re-asking questions the lead has answered once already.
  useEffect(() => {
    const savedAnswers = leadQualification.data?.answers;
    if (!savedAnswers) return;
    const currentAnswers = form.getValues('answers') ?? {};
    form.setValue('answers', { ...savedAnswers, ...currentAnswers }, { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadQualification.data]);

  const createAppointment = useCreateAppointment();
  const recordAnswers = useRecordQualificationAnswers();

  const questions = qualificationForm?.questions ?? [];

  const handleSubmit = form.handleSubmit(async (booking) => {
    // Answers first: the appointment is the irreversible half, and a lead that is scored
    // but unbooked is a smaller mess than a booked lead whose answers silently vanished.
    if (Object.keys(booking.answers).length > 0) {
      await recordAnswers.mutateAsync({ leadId: booking.leadId, answers: booking.answers });
    }

    createAppointment.mutate(
      {
        leadId: booking.leadId,
        customerName: booking.customerName?.trim() || null,
        customerPhone: booking.customerPhone,
        scheduledAt: booking.scheduledAt,
        staffId: null,
        notes: booking.notes?.trim() || null,
        allowOutsideAvailability: booking.isCustomTime,
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
    questions,
    config,
    availability: availability.data,
    isLoadingAvailability: availability.isLoading,
    isLoadingAnswers: leadQualification.isLoading,
    isBooking: createAppointment.isPending || recordAnswers.isPending,
    handleSubmit,
    resetForm: () => form.reset(EMPTY_BOOKING),
  };
}
