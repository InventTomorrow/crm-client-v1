"use client";
import { useClinicalServices } from "@/features/clinical-services/hooks/useClinicalServices";
import {
  AutoCompleteSelect,
  type AutoCompleteSelectOption,
} from "@/shared/ui/AutoCompleteSelect";
import { useMemo, useState } from "react";
import { BookingsSegmentView } from "./BookingsSegmentView";

/** Appointments on the clinic's own calendar — booked for a service, with no doctor named. */
export function ClinicalBookingsView() {
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const { data: clinicalServices } = useClinicalServices();

  const serviceOptions: AutoCompleteSelectOption[] = useMemo(
    () =>
      (clinicalServices ?? []).map((service) => ({
        id: service.id,
        label: service.name,
      })),
    [clinicalServices],
  );

  const selectedService =
    serviceOptions.find((option) => option.id === serviceFilter) ?? null;

  return (
    <BookingsSegmentView
      bookingType="CLINIC"
      title="Clinical bookings"
      subtitle="Appointments booked with the clinic for a service."
      showClinicalService
      emptyMessage="No clinical bookings yet."
      siblingLink={{ href: "/bookings/doctors", label: "Doctor bookings" }}
      extraFilters={serviceFilter ? { clinicalServiceId: serviceFilter } : {}}
      hasExtraFilter={serviceFilter !== ""}
      onClearExtraFilter={() => setServiceFilter("")}
      filterControl={
        <AutoCompleteSelect
          items={serviceOptions}
          selected={selectedService}
          onSelect={(option) => setServiceFilter(option?.id ?? "")}
          placeholder="All services"
          emptyLabel="No services yet"
          className="h-9 w-[220px] text-[12.5px]"
        />
      }
    />
  );
}
