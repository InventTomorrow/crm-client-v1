"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import type { BusinessVertical } from "@/lib/business-verticals";
import { CalendarCheck, Flame, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { STATUS_META, type LeadStatusMeta } from "../types";

/**
 * A clinic runs patient intake, not a sales pipeline. The stored enum is still
 * PROSPECT/COLD/WARM/HOT/CLOSED — only what the user reads changes, so nothing
 * here touches the API contract or the CSV's own status values.
 */
const HEALTHCARE_STATUS_LABELS: Record<string, string> = {
  prospect: "New enquiry",
  cold: "Unresponsive",
  warm: "In intake",
  hot: "Ready to book",
  closed: "Booked",
};

export interface LeadVocabulary {
  /** Lowercase, for mid-sentence copy: "Delete this patient permanently?" */
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
  statusMeta: Object.fromEntries(
    Object.entries(STATUS_META).map(([status, meta]) => [
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
