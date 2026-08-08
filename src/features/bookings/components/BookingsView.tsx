"use client";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { Skeleton } from "@/shared/ui/Skeleton";
import { StatCard } from "@/shared/ui/StatCard";
import {
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CalendarX2,
  ListFilter,
  Plus,
  Rows3,
  Settings2,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useAppointmentsQuery,
  useBookingConfigQuery,
  useBookingStatsQuery,
} from "../hooks/useBookings";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "../types";
import {
  APPOINTMENT_STATUS_ICONS,
  countWeeklySlots,
  isBookingConfigured,
} from "../utils/appointmentFormat";
import { AppointmentsList } from "./AppointmentsList";
import { BookAppointmentSheet } from "./BookAppointmentSheet";
import { BookingsCalendar } from "./BookingsCalendar";
import { BookingsEmptyState } from "./BookingsEmptyState";
import { QuickAppointmentDialog } from "./QuickAppointmentDialog";

const ALL_STATUSES = "ALL";
const DEFAULT_TIMEZONE = "Asia/Karachi";
const DEFAULT_DURATION_MINUTES = 30;

type BookingsViewMode = "table" | "calendar";

const VIEW_MODES: { id: BookingsViewMode; label: string; Icon: typeof Rows3 }[] = [
  { id: "table", label: "Table", Icon: Rows3 },
  { id: "calendar", label: "Calendar", Icon: CalendarRange },
];

/** Landing page for the bookings section: the booked calls as a table or a week calendar,
 * plus the stats above them. */
export function BookingsView() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<BookingsViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<
    AppointmentStatus | typeof ALL_STATUSES
  >(ALL_STATUSES);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false);
  // Set when the dialog was opened from a calendar slot rather than the header button.
  const [quickDialogStartsAt, setQuickDialogStartsAt] = useState<string | null>(null);

  const { data: config, isLoading: isLoadingConfig } = useBookingConfigQuery();
  const { data: statusCounts } = useBookingStatsQuery();

  const appointmentsQuery = useAppointmentsQuery(
    statusFilter === ALL_STATUSES ? {} : { status: statusFilter },
  );

  const appointments = useMemo(
    () => appointmentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [appointmentsQuery.data],
  );

  const timezone = config?.timezone ?? DEFAULT_TIMEZONE;
  const durationMinutes = config?.durationMinutes ?? DEFAULT_DURATION_MINUTES;

  const goToAvailability = () => router.push("/bookings/availability");

  const openQuickDialog = (startsAt: string | null) => {
    setQuickDialogStartsAt(startsAt);
    setIsQuickDialogOpen(true);
  };

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[18px] font-semibold text-[var(--ink)]">
            Bookings
          </h1>
          {config && (
            <Badge
              variant={config.isActive ? "default" : "secondary"}
              className="text-[10px]"
            >
              {config.isActive ? "Accepting bookings" : "Paused"}
            </Badge>
          )}
        </div>
        <p className="text-[12px] text-[var(--ink-mute)]">
          Calls the bot and your team have booked.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isBookingConfigured(config) && (
          <Button size="lg" variant="outline" onClick={goToAvailability}>
            <Settings2 size={14} className="mr-1.5" /> Availability
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={() => openQuickDialog(null)}>
          <Plus size={14} className="mr-1.5" /> Add appointment
        </Button>
        <Button size="lg" onClick={() => setIsBookingSheetOpen(true)}>
          <UserPlus size={14} className="mr-1.5" /> Book a call
        </Button>
      </div>
    </div>
  );

  const quickDialog = (
    <QuickAppointmentDialog
      open={isQuickDialogOpen}
      onOpenChange={(nextOpen) => {
        setIsQuickDialogOpen(nextOpen);
        if (!nextOpen) setQuickDialogStartsAt(null);
      }}
      timezone={timezone}
      durationMinutes={durationMinutes}
      initialScheduledAt={quickDialogStartsAt}
    />
  );

  if (isLoadingConfig) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!isBookingConfigured(config)) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        {header}
        <BookingsEmptyState
          onSetup={goToAvailability}
          onBookManually={() => setIsBookingSheetOpen(true)}
        />
        <BookAppointmentSheet
          open={isBookingSheetOpen}
          onOpenChange={setIsBookingSheetOpen}
        />
        {quickDialog}
      </div>
    );
  }

  const viewSwitch = (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-0.5">
      {VIEW_MODES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={viewMode === id}
          onClick={() => setViewMode(id)}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-colors",
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

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          hint={statusCounts?.CANCELLED ? "Reschedule to win them back" : undefined}
          Icon={CalendarX2}
        />
        <StatCard
          label="Slots per week"
          value={countWeeklySlots(config!)}
          hint={`${config!.durationMinutes} min each`}
          Icon={Settings2}
        />
      </div>

      {viewMode === "calendar" ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">{viewSwitch}</div>
          <BookingsCalendar
            timezone={timezone}
            durationMinutes={durationMinutes}
            workingHours={config!.workingHours}
            onCreateAtSlot={openQuickDialog}
          />
        </div>
      ) : (
        <AppointmentsList
          appointments={appointments}
          timezone={timezone}
          isLoading={appointmentsQuery.isLoading}
          hasNextPage={!!appointmentsQuery.hasNextPage}
          isFetchingNextPage={appointmentsQuery.isFetchingNextPage}
          onLoadMore={() => appointmentsQuery.fetchNextPage()}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-medium text-[var(--ink-mute)]">
                Status:
              </span>
              <Select
                value={statusFilter}
                onValueChange={(nextStatus) =>
                  setStatusFilter(nextStatus as AppointmentStatus | typeof ALL_STATUSES)
                }
              >
                <SelectTrigger className="h-8 w-[160px] text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>
                    <ListFilter size={13} className="mr-1.5 text-[var(--ink-mute)]" />
                    All statuses
                  </SelectItem>
                  {APPOINTMENT_STATUSES.map((status) => {
                    const StatusIcon = APPOINTMENT_STATUS_ICONS[status];
                    return (
                      <SelectItem key={status} value={status}>
                        <StatusIcon size={13} className="mr-1.5 text-[var(--ink-mute)]" />
                        {APPOINTMENT_STATUS_LABELS[status]}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="ml-auto">{viewSwitch}</div>
            </div>
          }
        />
      )}

      <BookAppointmentSheet
        open={isBookingSheetOpen}
        onOpenChange={setIsBookingSheetOpen}
      />
      {quickDialog}
    </div>
  );
}
