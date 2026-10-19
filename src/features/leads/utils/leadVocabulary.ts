"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import type { BusinessVertical } from "@/lib/business-verticals";
import { CalendarCheck, Flame, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { BOOKED_STATUS_META, STATUS_META, type LeadStatusMeta } from "../types";

/**
 * A clinic runs patient intake, not a sales pipeline. Its labels are its own,
 * and it alone has BOOKED (a live appointment) — the server moves a patient
 * there on booking and on to CLOSED once the appointment is completed.
 */
const HEALTHCARE_STATUS_LABELS: Record<string, string> = {
  prospect: "New enquiry",
  cold: "Unresponsive",
  warm: "In intake",
  hot: "Ready to book",
  booked: "Booked",
  closed: "Completed",
};

/** Default statuses with BOOKED placed after HOT, so the kanban reads left to right. */
const HEALTHCARE_STATUS_META: Record<string, LeadStatusMeta> = Object.fromEntries(
  Object.entries(STATUS_META).flatMap(([status, meta]) =>
    status === "hot" ? [[status, meta], ["booked", BOOKED_STATUS_META]] : [[status, meta]],
  ),
);

export interface LeadVocabulary {
  singular: string;
  plural: string;
  /** Capitalised, for headings and buttons: "Add patient". */
  singularTitle: string;
  pluralTitle: string;
  pageTitle: string;
  pageSubtitle: string;
  /** Label of the HOT column/stat — the stage worth chasing today. */
  urgentLabel: string;
  UrgentIcon: LucideIcon;
  statusMeta: Record<string, LeadStatusMeta>;
  /** The person on the receiving end of a booking or order. A clinic serves
   * patients, everyone else serves customers — separate from the pipeline word
   * above, which stays "lead" outside healthcare. */
  customerSingular: string;
  customerSingularTitle: string;
  customerPlural: string;
  /** What a booked slot is called: a service-based business books a call, a clinic books an appointment. */
  bookingSingular: string;
  bookingSingularTitle: string;
  /** The same word with its article, so copy never has to pick between "a" and "an". */
  bookingSingularWithArticle: string;
}

const DEFAULT_VOCABULARY: LeadVocabulary = {
  singular: "lead",
  plural: "leads",
  singularTitle: "Lead",
  pluralTitle: "Leads",
  pageTitle: "Leads pipeline",
  pageSubtitle: "Track and convert your pipeline",
  urgentLabel: "Hot leads",
  UrgentIcon: Flame,
  statusMeta: STATUS_META,
  customerSingular: "customer",
  customerSingularTitle: "Customer",
  customerPlural: "customers",
  bookingSingular: "call",
  bookingSingularTitle: "Call",
  bookingSingularWithArticle: "a call",
};

const HEALTHCARE_VOCABULARY: LeadVocabulary = {
  singular: "patient",
  plural: "patients",
  singularTitle: "Patient",
  pluralTitle: "Patients",
  pageTitle: "Patients",
  pageSubtitle: "Track enquiries from first message to booked appointment",
  urgentLabel: "Ready to book",
  UrgentIcon: CalendarCheck,
  customerSingular: "patient",
  customerSingularTitle: "Patient",
  customerPlural: "patients",
  bookingSingular: "appointment",
  bookingSingularTitle: "Appointment",
  bookingSingularWithArticle: "an appointment",
  statusMeta: Object.fromEntries(
    Object.entries(HEALTHCARE_STATUS_META).map(([status, meta]) => [
      status,
      { ...meta, label: HEALTHCARE_STATUS_LABELS[status] ?? meta.label },
    ]),
  ),
};

export function leadVocabularyFor(
  businessVertical: BusinessVertical | undefined,
): LeadVocabulary {
  return businessVertical === "HEALTHCARE"
    ? HEALTHCARE_VOCABULARY
    : DEFAULT_VOCABULARY;
}

/** The words this workspace uses for a lead. Every user-facing string in the
 * leads module reads from here instead of hardcoding "lead". */
export function useLeadVocabulary(): LeadVocabulary {
  const { tenant } = useCurrentTenant();
  return useMemo(
    () => leadVocabularyFor(tenant?.businessVertical),
    [tenant?.businessVertical],
  );
}

/** Status label for a backend enum value (PROSPECT, HOT, …), used by the
 * import dialog, which works in the server's casing rather than the client's. */
export function statusLabelForEnum(
  vocabulary: LeadVocabulary,
  statusEnum: string,
): string {
  const meta = vocabulary.statusMeta[statusEnum.toLowerCase()];
  if (meta) return meta.label;
  return statusEnum.charAt(0) + statusEnum.slice(1).toLowerCase();
}
