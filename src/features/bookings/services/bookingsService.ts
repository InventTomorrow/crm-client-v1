import { apiClient } from '@/lib/apiClient';
import type {
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
  AppointmentStatusCounts,
  Availability,
  BookingConfig,
  BookingConfigFormData,
  CreateAppointmentFormData,
} from '../types';

export async function getBookingConfig() {
  const res = await apiClient.get<{ success: true; data: BookingConfig | null }>(
    '/bookings/config',
  );
  return res.data.data;
}

export async function upsertBookingConfig(payload: BookingConfigFormData) {
  const res = await apiClient.put<{ success: true; data: BookingConfig }>(
    '/bookings/config',
    payload,
  );
  return res.data.data;
}

export async function getAvailability(params: { from?: string; days?: number; staffId?: string }) {
  const res = await apiClient.get<{ success: true; data: Availability }>(
    '/bookings/availability',
    { params },
  );
  return res.data.data;
}

export async function getAppointments(
  params: AppointmentFilters & { cursor?: string; limit?: number },
) {
  const res = await apiClient.get<{
    success: true;
    data: Appointment[];
    nextCursor: string | null;
  }>('/bookings/appointments', { params });
  return { items: res.data.data ?? [], nextCursor: res.data.nextCursor };
}

export async function createAppointment(payload: CreateAppointmentFormData) {
  const res = await apiClient.post<{ success: true; data: Appointment }>(
    '/bookings/appointments',
    payload,
  );
  return res.data.data;
}

export async function rescheduleAppointment(
  appointmentId: string,
  payload: { scheduledAt: string; staffId?: string | null },
) {
  const res = await apiClient.patch<{ success: true; data: Appointment }>(
    `/bookings/appointments/${appointmentId}/reschedule`,
    payload,
  );
  return res.data.data;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  payload: { status: AppointmentStatus; cancelReason?: string | null },
) {
  const res = await apiClient.patch<{ success: true; data: Appointment }>(
    `/bookings/appointments/${appointmentId}/status`,
    payload,
  );
  return res.data.data;
}

export async function deleteAppointment(appointmentId: string) {
  await apiClient.delete(`/bookings/appointments/${appointmentId}`);
  return { appointmentId };
}

export async function getBookingStats() {
  const res = await apiClient.get<{ success: true; data: AppointmentStatusCounts }>(
    '/bookings/stats',
  );
  return res.data.data;
}
