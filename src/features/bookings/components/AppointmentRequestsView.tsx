"use client";
import { Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/NativeSelect";
import { useAppointmentRequests, useUpdateAppointmentRequestStatus } from "../hooks/useAppointmentRequests";
import type { AppointmentRequestStatus } from "../services/appointmentRequestsService";

const STATUSES: { key: AppointmentRequestStatus; label: string }[] = [
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "BOOKED", label: "Booked" },
  { key: "CLOSED", label: "Closed" },
];

const FILTERS: { key: AppointmentRequestStatus | undefined; label: string }[] = [
  { key: "NEW", label: "New" },
  { key: undefined, label: "All" },
];

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/**
 * Appointments patients asked for in chat where the assistant cannot book a
 * time itself. The assistant collected the need and a preferred time and told
 * the team; a coordinator books it and moves the request along here.
 */
export function AppointmentRequestsView() {
  const [filter, setFilter] = useState<AppointmentRequestStatus | undefined>("NEW");
  const { data: requests = [], isLoading } = useAppointmentRequests(filter);
  const { mutate: setStatus, isPending, variables } = useUpdateAppointmentRequestStatus();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold">Appointment requests</h1>
          <p className="text-[12.5px] text-[var(--ink-mute)] mt-1">
            Taken by the assistant in chat — book each one, then mark it here.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-[var(--line)] p-0.5">
          {FILTERS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setFilter(option.key)}
              className={cn(
                "rounded-md px-3 py-1 text-[12px] font-medium",
                filter === option.key ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-soft)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-8 text-center text-[12.5px] text-[var(--ink-mute)]">
          {filter === "NEW" ? "No new requests." : "No appointment requests yet."}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {requests.map((request) => (
            <li key={request.id} className="card p-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex flex-col gap-1">
                <p className="text-[13px] font-semibold text-[var(--ink)]">{request.careNeeded}</p>
                <p className="text-[12px] text-[var(--ink-soft)]">
                  {request.preferredTime ? `Prefers: ${request.preferredTime}` : "No preferred time given"}
                  {request.practitionerName ? ` · Asked for ${request.practitionerName}` : ""}
                </p>
                <p className="text-[11.5px] text-[var(--ink-mute)]">
                  {request.patientName ?? request.lead?.name ?? "Patient"}
                  {request.lead?.phone ? ` · ${request.lead.phone}` : ""} · {dateTime.format(new Date(request.createdAt))}
                </p>
                {request.notes && <p className="text-[11.5px] text-[var(--ink-soft)]">{request.notes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {request.status === "NEW" && <Badge variant="secondary">New</Badge>}
                <Link
                  href={`/inbox?lead=${request.leadId}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2.5 py-1 text-[12px] text-[var(--ink-soft)] no-underline hover:bg-[var(--surface-2)]"
                >
                  <MessageSquare size={13} /> Chat
                </Link>
                <NativeSelect
                  size="sm"
                  aria-label="Status"
                  value={request.status}
                  disabled={isPending && variables?.id === request.id}
                  onChange={(event) =>
                    setStatus({ id: request.id, status: event.target.value as AppointmentRequestStatus })
                  }
                >
                  {STATUSES.map((status) => (
                    <NativeSelectOption key={status.key} value={status.key}>
                      {status.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
