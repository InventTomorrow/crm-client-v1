'use client';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatCard } from '@/shared/ui/StatCard';
import {
  CalendarCheck,
  CalendarClock,
  CalendarX2,
  ListFilter,
  Plus,
  Settings2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  useAppointmentsQuery,
  useBookingConfigQuery,
  useBookingStatsQuery,
} from '../hooks/useBookings';
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from '../types';
import {
  APPOINTMENT_STATUS_ICONS,
  countWeeklySlots,
  isBookingConfigured,
} from '../utils/appointmentFormat';
import { AppointmentsList } from './AppointmentsList';
import { BookAppointmentSheet } from './BookAppointmentSheet';
import { BookingsEmptyState } from './BookingsEmptyState';

const ALL_STATUSES = 'ALL';

/** Landing page for the bookings section: the calendar of booked calls, plus the stats above it. */
export function BookingsView() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | typeof ALL_STATUSES>(
    ALL_STATUSES,
  );
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);

  const { data: config, isLoading: isLoadingConfig } = useBookingConfigQuery();
  const { data: statusCounts } = useBookingStatsQuery();

  const appointmentsQuery = useAppointmentsQuery(
    statusFilter === ALL_STATUSES ? {} : { status: statusFilter },
  );

  const appointments = useMemo(
    () => appointmentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [appointmentsQuery.data],
  );

  const goToAvailability = () => router.push('/bookings/availability');

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[18px] font-semibold text-[var(--ink)]">Bookings</h1>
          {config && (
            <Badge
              variant={config.isActive ? 'default' : 'secondary'}
              className="text-[10px]"
            >
              {config.isActive ? 'Accepting bookings' : 'Paused'}
            </Badge>
          )}
        </div>
        <p className="text-[12px] text-[var(--ink-mute)]">
          Calls the bot and your team have booked.
        </p>
      </div>

      {/* Booking by hand never depended on the bot's calendar — the owner may be recording a
          call they already agreed. Only the availability editor needs a saved config. */}
      <div className="flex flex-wrap gap-2">
        {isBookingConfigured(config) && (
          <Button size="lg" variant="outline" onClick={goToAvailability}>
            <Settings2 size={14} className="mr-1.5" /> Availability
          </Button>
        )}
        <Button size="lg" onClick={() => setIsBookingSheetOpen(true)}>
          <Plus size={14} className="mr-1.5" /> Book a call
        </Button>
      </div>
    </div>
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
      </div>
    );
  }

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
          hint={statusCounts?.CANCELLED ? 'Reschedule to win them back' : undefined}
          Icon={CalendarX2}
        />
        <StatCard
          label="Slots per week"
          value={countWeeklySlots(config!)}
          hint={`${config!.durationMinutes} min each`}
          Icon={Settings2}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-[var(--ink)]">Appointments</p>
        <Select
          value={statusFilter}
          onValueChange={(nextStatus) =>
            setStatusFilter(nextStatus as AppointmentStatus | typeof ALL_STATUSES)
          }
        >
          <SelectTrigger className="w-[180px]">
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
      </div>

      <AppointmentsList
        appointments={appointments}
        timezone={config!.timezone}
        isLoading={appointmentsQuery.isLoading}
        hasNextPage={!!appointmentsQuery.hasNextPage}
        isFetchingNextPage={appointmentsQuery.isFetchingNextPage}
        onLoadMore={() => appointmentsQuery.fetchNextPage()}
      />

      <BookAppointmentSheet
        open={isBookingSheetOpen}
        onOpenChange={setIsBookingSheetOpen}
      />
    </div>
  );
}
