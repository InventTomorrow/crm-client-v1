"use client";
import {
  AutoCompleteSelect,
  type AutoCompleteSelectOption,
} from "@/shared/ui/AutoCompleteSelect";
import { useMemo, useState } from "react";
import { useInfinitePractitioners } from "@/features/practitioners/hooks/usePractitioners";
import { practitionerDisplayName } from "@/features/practitioners/types";
import { BookingsSegmentView } from "./BookingsSegmentView";

/** Appointments booked with a named practitioner, on that doctor's own calendar. */
export function DoctorBookingsView() {
  const [practitionerFilter, setPractitionerFilter] = useState<string>("");
  const practitionersQuery = useInfinitePractitioners({ isActive: true });

  const practitionerOptions: AutoCompleteSelectOption[] = useMemo(
    () =>
      (practitionersQuery.data?.pages.flatMap((page) => page) ?? []).map(
        (practitioner) => ({
          id: practitioner.id,
          label: practitionerDisplayName(practitioner),
        }),
      ),
    [practitionersQuery.data],
  );

  const selectedPractitioner =
    practitionerOptions.find((option) => option.id === practitionerFilter) ?? null;

  return (
    <BookingsSegmentView
      bookingType="PRACTITIONER"
      title="Doctor bookings"
      subtitle="Appointments booked with a named practitioner."
      showPractitioner
      showClinicalService
      emptyMessage="No doctor bookings yet."
      siblingLink={{ href: "/bookings/clinical", label: "Clinical bookings" }}
      extraFilters={
        practitionerFilter ? { practitionerId: practitionerFilter } : {}
      }
      hasExtraFilter={practitionerFilter !== ""}
      onClearExtraFilter={() => setPractitionerFilter("")}
      filterControl={
        <AutoCompleteSelect
          items={practitionerOptions}
          selected={selectedPractitioner}
          onSelect={(option) => setPractitionerFilter(option?.id ?? "")}
          placeholder="All doctors"
          emptyLabel="No practitioners yet"
          className="h-9 w-[220px] text-[12.5px]"
        />
      }
    />
  );
}
