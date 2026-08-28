"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { RefreshButton } from "@/shared/ui/RefreshButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { StatCard } from "@/shared/ui/StatCard";
import {
  ArrowLeftRight,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CalendarX2,
  ListFilter,
  Rows3,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  useAppointmentsQuery,
  useBookingConfigQuery,
  useBookingStatsQuery,
  useRefreshBookings,
} from "../hooks/useBookings";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentFilters,
  type AppointmentStatus,
  type BookingType,
} from "../types";
import { APPOINTMENT_STATUS_ICONS } from "../utils/appointmentFormat";
import { AppointmentsList } from "./AppointmentsList";
import { BookingsCalendar } from "./BookingsCalendar";

const ALL_STATUSES = "ALL";
const DEFAULT_TIMEZONE = "Asia/Karachi";
const DEFAULT_DURATION_MINUTES = 30;

type BookingsViewMode = "table" | "calendar";

const VIEW_MODES: {
  id: BookingsViewMode;
  label: string;
  Icon: typeof Rows3;
}[] = [
  { id: "table", label: "Table", Icon: Rows3 },
  { id: "calendar", label: "Calendar", Icon: CalendarRange },
];

interface BookingsSegmentViewProps {
  /** Which calendar this page lists — the clinic's own, or a doctor's. */
  bookingType: BookingType;
  title: string;
  subtitle: string;
  /** Narrows the list further: the doctor or service the parent's own picker chose. */
  extraFilters?: Pick<
    AppointmentFilters,
    "practitionerId" | "clinicalServiceId"
  >;
  /** The parent's picker, rendered beside the status filter. */
  filterControl?: ReactNode;
  /** True while the parent's picker has something chosen — drives the Clear button. */
  hasExtraFilter?: boolean;
  onClearExtraFilter?: () => void;
  showPractitioner?: boolean;
  showClinicalService?: boolean;
  emptyMessage: string;
  /** The other booking page. /bookings sends a clinic straight back here, so it is
   * the sibling that is worth a link, not the combined list. */
  siblingLink: { href: string; label: string };
}

/**
 * One booking type's appointments. Both healthcare booking pages are this view
 * with a different type and a different picker — the stats, status filter and
 * table are identical, and duplicating them is how they would drift apart.
 */
export function BookingsSegmentView({
  bookingType,
  title,
  subtitle,
  extraFilters,
  filterControl,
  hasExtraFilter = false,
  onClearExtraFilter,
  showPractitioner = false,
  showClinicalService = false,
  emptyMessage,
  siblingLink,
}: BookingsSegmentViewProps) {
  const [viewMode, setViewMode] = useState<BookingsViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<
    AppointmentStatus | typeof ALL_STATUSES
  >(ALL_STATUSES);

  const { data: config } = useBookingConfigQuery();
  const { data: statusCounts } = useBookingStatsQuery(bookingType);
  const { refreshBookings, isRefreshing } = useRefreshBookings();

  const appointmentsQuery = useAppointmentsQuery({
    bookingType,
    ...extraFilters,
    ...(statusFilter === ALL_STATUSES ? {} : { status: statusFilter }),
  });

  const appointments =
    appointmentsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const timezone = config?.timezone ?? DEFAULT_TIMEZONE;
  const durationMinutes = config?.durationMinutes ?? DEFAULT_DURATION_MINUTES;

  const isFiltered = statusFilter !== ALL_STATUSES || hasExtraFilter;

  const viewSwitch = (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex h-9 items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-0.5"
    >
      {VIEW_MODES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={viewMode === id}
          onClick={() => setViewMode(id)}
          className={cn(
            "flex h-full items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
            viewMode === id
              ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm"
              : "text-[var(--ink-mute)] hover:text-[var(--ink)]",
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );

  // One bar for both views, so a filter does not move or vanish when the view flips.
  const filterBar = (
    <div className="flex flex-row items-center gap-2">
      <Select
        value={statusFilter}
        onValueChange={(nextStatus) =>
          setStatusFilter(nextStatus as AppointmentStatus | typeof ALL_STATUSES)
        }
      >
        <SelectTrigger className="h-9 w-[168px] text-[12.5px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES}>
            <ListFilter size={13} className="mr-1.5 text-[var(--ink-mute)]" />
            All statuses
          </SelectItem>
          {APPOINTMENT_STATUSES?.map((status) => {
            const StatusIcon = APPOINTMENT_STATUS_ICONS[status];
            return (
              <SelectItem key={status} value={status}>
                <StatusIcon
                  size={13}
                  className="mr-1.5 text-[var(--ink-mute)]"
                />
                {APPOINTMENT_STATUS_LABELS[status]}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {filterControl}

      {isFiltered && (
        <button
          type="button"
          onClick={() => {
            setStatusFilter(ALL_STATUSES);
            onClearExtraFilter?.();
          }}
          className="flex items-center gap-1 text-[12px] text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
        >
          <X size={13} /> Clear
        </button>
      )}

      <div className="ml-auto">{viewSwitch}</div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--ink)]">
            {title}
          </h1>
          <p className="text-[12px] text-[var(--ink-mute)]">{subtitle}</p>
        </div>
        <div
          data-tour="page-actions"
          className="flex flex-wrap items-center gap-2"
        >
          <RefreshButton
            onRefresh={refreshBookings}
            isRefreshing={isRefreshing}
            size="icon-lg"
            label="Refresh appointments"
          />
          <Button size="lg" variant="outline" asChild>
            <Link href={siblingLink.href}>
              <ArrowLeftRight size={14} className="mr-1.5" />{" "}
              {siblingLink.label}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={(statusCounts?.CONFIRMED ?? 0) + (statusCounts?.PENDING ?? 0)}
          hint={`${statusCounts?.PENDING ?? 0} awaiting confirmation`}
          Icon={CalendarClock}
        />
        <StatCard
          label="Completed"
          value={statusCounts?.COMPLETED ?? 0}
          hint="Slot freed"
          Icon={CalendarCheck}
        />
        <StatCard
          label="Cancelled"
          value={statusCounts?.CANCELLED ?? 0}
          hint={
            statusCounts?.CANCELLED ? "Reschedule to win them back" : undefined
          }
          Icon={CalendarX2}
        />
      </div>

      {viewMode === "calendar" ? (
        <div className="flex flex-col gap-3">
          {filterBar}
          <BookingsCalendar
            timezone={timezone}
            durationMinutes={durationMinutes}
            workingHours={config?.workingHours ?? []}
            filters={{
              bookingType,
              ...extraFilters,
              ...(statusFilter === ALL_STATUSES
                ? {}
                : { status: statusFilter }),
            }}
          />
        </div>
      ) : (
        <AppointmentsList
          appointments={appointments}
          timezone={timezone}
          isLoading={appointmentsQuery.isLoading}
          showPractitioner={showPractitioner}
          showClinicalService={showClinicalService}
          emptyMessage={emptyMessage}
          toolbar={filterBar}
        />
      )}
    </div>
  );
}
