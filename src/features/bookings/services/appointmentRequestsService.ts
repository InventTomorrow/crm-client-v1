import { apiClient } from "@/lib/apiClient";

export type AppointmentRequestStatus = "NEW" | "CONTACTED" | "BOOKED" | "CLOSED";

/** What a patient asked for where the assistant cannot book times — a coordinator books it. */
export interface AppointmentRequest {
  id: string;
  leadId: string;
  conversationId: string | null;
  careNeeded: string;
  preferredTime: string | null;
  patientName: string | null;
  practitionerName: string | null;
  notes: string | null;
  status: AppointmentRequestStatus;
  createdAt: string;
  updatedAt: string;
  lead: { id: string; name: string | null; phone: string | null } | null;
}

export async function listAppointmentRequests(status?: AppointmentRequestStatus): Promise<AppointmentRequest[]> {
  const res = await apiClient.get<{ success: true; data: AppointmentRequest[] }>("/appointment-requests", {
    params: status ? { status } : {},
  });
  return res.data.data;
}

export async function updateAppointmentRequestStatus(id: string, status: AppointmentRequestStatus) {
  await apiClient.patch(`/appointment-requests/${id}`, { status });
}
