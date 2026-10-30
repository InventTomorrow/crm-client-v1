"use client";
import {
  Clock,
  Inbox,
  List,
  MessageSquare,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { SeedRecordsButton } from "@/features/seed/components/SeedRecordsButton";
import { cn } from "@/lib/utils";
import { useUrlEnumState } from "@/shared/hooks/useUrlEnumState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/NativeSelect";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import {
  LINE_TAB_LIST_CLASS,
  LINE_TAB_TRIGGER_CLASS,
} from "@/shared/ui/tabStyles";
import {
  useAppointmentRequests,
  useUpdateAppointmentRequestStatus,
} from "../hooks/useAppointmentRequests";
import type { AppointmentRequestStatus } from "../services/appointmentRequestsService";

const STATUSES: { key: AppointmentRequestStatus; label: string }[] = [
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "BOOKED", label: "Booked" },
  { key: "CLOSED", label: "Closed" },
];

const STATUS_LABELS = Object.fromEntries(
  STATUSES.map((status) => [status.key, status.label]),
) as Record<AppointmentRequestStatus, string>;

const ALL_REQUESTS = "ALL";
type RequestFilter =
  Extract<AppointmentRequestStatus, "NEW"> | typeof ALL_REQUESTS;

const FILTERS = [
  { key: "NEW", label: "New", Icon: Inbox },
  { key: ALL_REQUESTS, label: "All", Icon: List },
] as const;
const FILTER_KEYS = FILTERS.map((option) => option.key);

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const actionLinkClass =
  "inline-flex h-9 items-center gap-1.5 border border-[var(--line)] px-3 text-[12px] font-medium text-[var(--ink-soft)] no-underline transition-colors hover:bg-[var(--surface-2)]";

/**
 * Appointments patients asked for in chat where the assistant cannot book a
 * time itself. The assistant collected the need and a preferred time and told
 * the team; a coordinator books it and moves the request along here.
 */
export function AppointmentRequestsView() {
  const [filter, setFilter] = useUrlEnumState<RequestFilter>(
    "status",
    FILTER_KEYS,
    "NEW",
  );
  const { data: requests = [], isLoading } = useAppointmentRequests(
    filter === ALL_REQUESTS ? undefined : filter,
  );
  const {
    mutate: setStatus,
    isPending,
    variables,
  } = useUpdateAppointmentRequestStatus();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold">Appointment requests</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-mute)]">
            Taken by the assistant in chat. Book each one, then mark it here.
          </p>
        </div>
        <SeedRecordsButton
          target={{
            recordType: "APPOINTMENT_REQUEST",
            label: "Appointment requests",
          }}
        />
      </div>

      <Tabs
        value={filter}
        onValueChange={(nextFilter) => setFilter(nextFilter as RequestFilter)}
      >
        <TabsList variant="line" className={LINE_TAB_LIST_CLASS}>
          {FILTERS.map((option) => (
            <TabsTrigger
              key={option.key}
              value={option.key}
              className={LINE_TAB_TRIGGER_CLASS}
            >
              <option.Icon className="size-4" />
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <ul className="flex flex-col gap-2" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <li
              key={index}
              className="card flex items-start gap-3 rounded-none p-4"
            >
              <Skeleton className="size-9 rounded-none" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-56 rounded-none" />
                <Skeleton className="h-3 w-72 max-w-full rounded-none" />
                <Skeleton className="h-3 w-44 rounded-none" />
              </div>
              <Skeleton className="h-9 w-32 rounded-none" />
            </li>
          ))}
        </ul>
      ) : requests.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 rounded-none p-10 text-center text-[12.5px] text-[var(--ink-mute)]">
          <Inbox size={22} className="text-[var(--ink-mute)]" />
          {filter === "NEW"
            ? "No new requests."
            : "No appointment requests yet."}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {requests.map((request) => {
            const patientName =
              request.patientName ?? request.lead?.name ?? "Patient";
            const isNew = request.status === "NEW";
            return (
              <li
                key={request.id}
                className={cn(
                  "card flex flex-col gap-3 rounded-none border-l-2 p-4 md:flex-row md:items-start md:justify-between",
                  isNew ? "border-l-[var(--accent)]" : "border-l-[var(--line)]",
                )}
              >
                <div className="flex min-w-0 gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center bg-[var(--surface-2)] text-[13px] font-semibold text-[var(--accent)]"
                  >
                    {patientName.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-[13.5px] font-semibold text-[var(--ink)]">
                        {request.careNeeded}
                      </p>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[11px] font-medium",
                          isNew
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
                        )}
                      >
                        {STATUS_LABELS[request.status]}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-soft)]">
                      {patientName}
                      {request.lead?.phone
                        ? ` · ${request.lead.phone}`
                        : ""} · {dateTime.format(new Date(request.createdAt))}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--ink-soft)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} className="text-[var(--ink-mute)]" />
                        {request.preferredTime
                          ? `Prefers ${request.preferredTime}`
                          : "No preferred time given"}
                      </span>
                      {request.practitionerName && (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound
                            size={13}
                            className="text-[var(--ink-mute)]"
                          />
                          Asked for {request.practitionerName}
                        </span>
                      )}
                    </div>
                    {request.notes && (
                      <p className="text-[11.5px] text-[var(--ink-mute)]">
                        {request.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/inbox?lead=${request.leadId}`}
                    className={actionLinkClass}
                  >
                    <MessageSquare size={13} /> Chat
                  </Link>
                  <NativeSelect
                    size="sm"
                    aria-label="Status"
                    value={request.status}
                    disabled={isPending && variables?.id === request.id}
                    onChange={(event) =>
                      setStatus({
                        id: request.id,
                        status: event.target.value as AppointmentRequestStatus,
                      })
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
