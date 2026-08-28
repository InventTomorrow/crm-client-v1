"use client";
import { useLeadVocabulary } from "@/features/leads/utils/leadVocabulary";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useUpdateAppointmentStatus } from "../hooks/useBookings";
import {
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
  type AppointmentStatus,
} from "../types";
import {
  APPOINTMENT_STATUS_ICONS,
  APPOINTMENT_STATUS_VARIANTS,
  confirmedTransitions,
  NEXT_STATUSES,
} from "../utils/appointmentFormat";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";

function StatusBadge({
  status,
  interactive,
}: {
  status: AppointmentStatus;
  interactive: boolean;
}) {
  const StatusIcon = APPOINTMENT_STATUS_ICONS[status];
  return (
    <Badge
      variant={APPOINTMENT_STATUS_VARIANTS[status]}
      className={cn(
        "gap-1 whitespace-nowrap text-[10px]",
        interactive && "cursor-pointer transition-opacity hover:opacity-85",
      )}
    >
      <StatusIcon size={10} />
      {APPOINTMENT_STATUS_LABELS[status]}
      {interactive && (
        <ChevronDown size={9} strokeWidth={2.4} className="opacity-70" />
      )}
    </Badge>
  );
}

/**
 * The status column, editable in place. Only the transitions the booking can
 * legally make are offered; cancelling routes through the reason dialog rather
 * than flipping silently, since that message goes out to the customer.
 */
export function AppointmentStatusCell({
  appointment,
}: {
  appointment: Appointment;
}) {
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(
    null,
  );
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const updateStatus = useUpdateAppointmentStatus();
  const vocabulary = useLeadVocabulary();
  const transitionCopy = confirmedTransitions(vocabulary);

  const selectableStatuses = NEXT_STATUSES[appointment.status];

  // A finished or cancelled booking has nowhere left to go — show it read-only.
  if (selectableStatuses.length === 0) {
    return <StatusBadge status={appointment.status} interactive={false} />;
  }

  const selectStatus = (status: AppointmentStatus) => {
    if (status === "CANCELLED") return setIsCancelOpen(true);
    if (transitionCopy[status]) return setPendingStatus(status);
    updateStatus.mutate({ appointmentId: appointment.id, status });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={updateStatus.isPending}>
          <button
            type="button"
            aria-label="Change appointment status"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 rounded-full"
            onClick={(event) => event.stopPropagation()}
          >
            <StatusBadge status={appointment.status} interactive />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onClick={(event) => event.stopPropagation()}
        >
          {selectableStatuses.map((status) => {
            const StatusIcon = APPOINTMENT_STATUS_ICONS[status];
            return (
              <DropdownMenuItem
                key={status}
                variant={status === "CANCELLED" ? "destructive" : "default"}
                disabled={updateStatus.isPending}
                onSelect={() => selectStatus(status)}
              >
                <StatusIcon size={13} /> {APPOINTMENT_STATUS_LABELS[status]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        loading={updateStatus.isPending}
        destructive={false}
        title={
          pendingStatus
            ? `Mark as ${APPOINTMENT_STATUS_LABELS[pendingStatus].toLowerCase()}?`
            : ""
        }
        description={pendingStatus ? transitionCopy[pendingStatus] : undefined}
        confirmLabel={
          pendingStatus ? APPOINTMENT_STATUS_LABELS[pendingStatus] : "Confirm"
        }
        onConfirm={() => {
          if (!pendingStatus) return;
          updateStatus.mutate(
            { appointmentId: appointment.id, status: pendingStatus },
            { onSuccess: () => setPendingStatus(null) },
          );
        }}
      />

      {isCancelOpen && (
        <CancelAppointmentDialog
          appointment={appointment}
          open
          onOpenChange={setIsCancelOpen}
        />
      )}
    </>
  );
}
