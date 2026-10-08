"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import {
  listAppointmentRequests,
  updateAppointmentRequestStatus,
  type AppointmentRequestStatus,
} from "../services/appointmentRequestsService";

const KEY = ["appointment-requests"];

export function useAppointmentRequests(status?: AppointmentRequestStatus) {
  return useQuery({
    queryKey: [...KEY, status ?? "ALL"],
    queryFn: () => listAppointmentRequests(status),
    // New requests arrive from chats while the page is open.
    refetchInterval: 60_000,
  });
}

export function useUpdateAppointmentRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentRequestStatus }) =>
      updateAppointmentRequestStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    onError: (error) => toast.error(extractErrorMessage(error, "Failed to update the request")),
  });
}
