'use client';
import { extractErrorMessage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  createAppointment,
  getAppointments,
  getAvailability,
  getBookingConfig,
  getBookingStats,
  rescheduleAppointment,
  updateAppointmentStatus,
  upsertBookingConfig,
} from '../services/bookingsService';
import {
  bookingConfigFormSchema,
  type AppointmentFilters,
  type AppointmentStatus,
  type BookingConfigFormData,
  type BookingConfigFormInput,
  type CreateAppointmentFormData,
} from '../types';

const PAGE_SIZE = 20;

const bookingKeys = {
  all: ['bookings'] as const,
  config: ['bookings', 'config'] as const,
  stats: ['bookings', 'stats'] as const,
  availability: (from: string | undefined, days: number) =>
    ['bookings', 'availability', from ?? 'today', days] as const,
  appointments: (filters: AppointmentFilters) =>
    ['bookings', 'appointments', filters] as const,
};

/** Sensible starting config for a workspace that has never set booking up. */
const INITIAL_CONFIG_VALUES: BookingConfigFormInput = {
  label: 'Free Strategy Session',
  description: '',
  meetingType: 'PHONE',
  durationMinutes: 30,
  bufferMinutes: 0,
  maxPerDay: 8,
  minAdvanceHours: 2,
  maxAdvanceDays: 30,
  timezone: 'Asia/Karachi',
  availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  // Morning and afternoon, closed over lunch — the shape most agencies start from.
  workingHours: [
    { startTime: '10:00', endTime: '13:00' },
    { startTime: '15:00', endTime: '18:00' },
  ],
  confirmationMessage: '',
  reminderMessage: '',
  reminderLeadMinutes: 60,
  assignedStaffIds: [],
  isActive: true,
};

export function useBookingConfigQuery() {
  return useQuery({
    queryKey: bookingKeys.config,
    queryFn: getBookingConfig,
  });
}

export function useBookingStatsQuery() {
  return useQuery({
    queryKey: bookingKeys.stats,
    queryFn: getBookingStats,
  });
}

export function useAvailabilityQuery(
  params: { from?: string; days?: number },
  options?: { enabled?: boolean },
) {
  const days = params.days ?? 14;
  return useQuery({
    queryKey: bookingKeys.availability(params.from, days),
    queryFn: () => getAvailability({ ...params, days }),
    enabled: options?.enabled ?? true,
  });
}

export function useAppointmentsQuery(filters: AppointmentFilters) {
  return useInfiniteQuery({
    queryKey: bookingKeys.appointments(filters),
    queryFn: ({ pageParam }) =>
      getAppointments({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

function useInvalidateBookings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: bookingKeys.all });
}

export function useUpsertBookingConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingConfigFormData) => upsertBookingConfig(payload),
    onSuccess: (savedConfig) => {
      queryClient.setQueryData(bookingKeys.config, savedConfig);
      // Availability is derived from the config — every cached day is now stale.
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success('Booking settings saved');
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, 'Failed to save booking settings')),
  });
}

export function useCreateAppointment() {
  const invalidateBookings = useInvalidateBookings();
  return useMutation({
    mutationFn: (payload: CreateAppointmentFormData) => createAppointment(payload),
    onSuccess: () => {
      invalidateBookings();
      toast.success('Appointment booked');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to book appointment')),
  });
}

export function useRescheduleAppointment() {
  const invalidateBookings = useInvalidateBookings();
  return useMutation({
    mutationFn: ({
      appointmentId,
      scheduledAt,
      staffId,
    }: {
      appointmentId: string;
      scheduledAt: string;
      staffId?: string | null;
    }) => rescheduleAppointment(appointmentId, { scheduledAt, staffId: staffId ?? null }),
    onSuccess: () => {
      invalidateBookings();
      toast.success('Appointment rescheduled');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to reschedule')),
  });
}

export function useUpdateAppointmentStatus() {
  const invalidateBookings = useInvalidateBookings();
  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
      cancelReason,
    }: {
      appointmentId: string;
      status: AppointmentStatus;
      cancelReason?: string | null;
    }) => updateAppointmentStatus(appointmentId, { status, cancelReason: cancelReason ?? null }),
    onSuccess: (updated) => {
      invalidateBookings();
      toast.success(`Marked as ${updated.status.toLowerCase().replace('_', '-')}`);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update appointment')),
  });
}

/**
 * Owns the booking-settings form: loads the saved config, seeds sensible
 * defaults for a first-time workspace, and upserts on submit. `onSaved` fires
 * only after the write lands so the caller can navigate without racing it.
 */
export function useBookingConfigForm(options?: { onSaved?: () => void }) {
  const { data: savedConfig, isLoading } = useBookingConfigQuery();

  const form = useForm<BookingConfigFormInput, unknown, BookingConfigFormData>({
    resolver: zodResolver(bookingConfigFormSchema),
    defaultValues: INITIAL_CONFIG_VALUES,
  });

  useEffect(() => {
    if (!savedConfig) return;
    form.reset({
      label: savedConfig.label,
      description: savedConfig.description ?? '',
      // Configs written before meetingType existed come back without it — fall
      // back so the select shows a real value instead of an empty box.
      meetingType: savedConfig.meetingType ?? 'PHONE',
      durationMinutes: savedConfig.durationMinutes,
      bufferMinutes: savedConfig.bufferMinutes,
      maxPerDay: savedConfig.maxPerDay,
      minAdvanceHours: savedConfig.minAdvanceHours,
      maxAdvanceDays: savedConfig.maxAdvanceDays,
      timezone: savedConfig.timezone,
      availableDays: savedConfig.availableDays,
      workingHours: savedConfig.workingHours,
      confirmationMessage: savedConfig.confirmationMessage,
      reminderMessage: savedConfig.reminderMessage,
      reminderLeadMinutes: savedConfig.reminderLeadMinutes,
      assignedStaffIds: savedConfig.assignedStaffIds,
      isActive: savedConfig.isActive,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedConfig]);

  const upsertConfig = useUpsertBookingConfig();

  const handleSubmit = form.handleSubmit((formData) => {
    upsertConfig.mutate(
      // Windows are added in whatever order the user thinks of them; persist in
      // clock order so the saved config reads the way the day runs.
      {
        ...formData,
        workingHours: [...formData.workingHours].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        ),
      },
      { onSuccess: () => options?.onSaved?.() },
    );
  });

  return {
    form,
    isLoading,
    isSaving: upsertConfig.isPending,
    hasSavedConfig: !!savedConfig,
    handleSubmit,
  };
}
