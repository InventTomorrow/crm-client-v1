import { z } from "zod";

/** Mirrors `CoverageLevel` on the server. */
export const COVERAGE_LEVELS = ["AVAILABLE", "LIMITED", "UNAVAILABLE"] as const;
export type CoverageLevel = (typeof COVERAGE_LEVELS)[number];

/**
 * `UNKNOWN` is not a stored value — it is what the resolver returns when no row
 * matches. Kept in the UI vocabulary because a blank cell means exactly that,
 * and the distinction from `UNAVAILABLE` matters: silence is never an implicit yes.
 */
export type ResolvedCoverageLevel = CoverageLevel | "UNKNOWN";

export const COVERAGE_META: Record<
  ResolvedCoverageLevel,
  { label: string; short: string; description: string }
> = {
  AVAILABLE: {
    label: "Available",
    short: "Yes",
    description:
      "The clinic operates here. Staffing is still confirmed by a coordinator.",
  },
  LIMITED: {
    label: "Limited",
    short: "Ltd",
    description:
      "Covered, but subject to staff availability. Always escalated.",
  },
  UNAVAILABLE: {
    label: "Not covered",
    short: "No",
    description: "The clinic does not serve this area. Always escalated.",
  },
  UNKNOWN: {
    label: "Not set",
    short: "—",
    description:
      "No row. The assistant will say coverage is unconfirmed and hand off.",
  },
};

export interface ClinicLocation {
  id: string;
  tenantId: string;
  city: string;
  area: string | null;
  branchName: string | null;
  addressLine: string | null;
  mapsUrl: string | null;
  contactPhone: string | null;
  handlesEmergencies: boolean;
  isOpen24x7: boolean;
  emergencyHoursNote: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** What the grid is currently doing to one cell, when it is doing anything. */
export type CoverageCellStatus = "saving" | "error";

export interface ClinicalServiceCoverage {
  id: string;
  tenantId: string;
  clinicalServiceId: string;
  city: string;
  area: string | null;
  coverage: CoverageLevel;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  leadTimeNote: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors `createClinicLocationSchema` on the server, including its emergency rule. */
export const clinicLocationFormSchema = z
  .object({
    city: z.string().trim().min(1, "City is required").max(80),
    area: z.string().trim().max(80).optional(),
    branchName: z.string().trim().max(120).optional(),
    addressLine: z.string().trim().max(300).optional(),
    mapsUrl: z.string().trim().max(2000).optional(),
    contactPhone: z.string().trim().max(40).optional(),
    handlesEmergencies: z.boolean().default(false),
    isOpen24x7: z.boolean().default(false),
    emergencyHoursNote: z.string().trim().max(200).optional(),
    isActive: z.boolean().default(true),
    displayOrder: z.coerce.number().int().default(0),
  })
  .refine(
    // Sending a patient somewhere unreachable in a crisis is not a valid state.
    (location) =>
      !location.handlesEmergencies || Boolean(location.contactPhone?.trim()),
    {
      path: ["contactPhone"],
      message: "An emergency location needs a contact phone number",
    },
  );

export type ClinicLocationFormValues = z.infer<typeof clinicLocationFormSchema>;

export const coverageRowSchema = z
  .object({
    clinicalServiceId: z.string().min(1),
    city: z.string().trim().min(1, "City is required").max(80),
    area: z.string().trim().max(80).nullable().optional(),
    coverage: z.enum(COVERAGE_LEVELS).default("AVAILABLE"),
    priceMin: z.coerce.number().min(0).nullable().optional(),
    priceMax: z.coerce.number().min(0).nullable().optional(),
    currency: z.string().trim().length(3).default("PKR"),
    leadTimeNote: z.string().trim().max(200).nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (row) =>
      row.priceMin == null ||
      row.priceMax == null ||
      row.priceMin <= row.priceMax,
    { path: ["priceMax"], message: "Max must be at least min" },
  );

export type CoverageRowValues = z.infer<typeof coverageRowSchema>;

/** A city/area pair the grid has a column for. */
export interface CoverageArea {
  city: string;
  area: string | null;
}

/** Stable identity for a city/area pair, matching the server's normalisation. */
export function areaKey(city: string, area: string | null | undefined): string {
  return `${city.trim().toLowerCase()}::${(area ?? "").trim().toLowerCase()}`;
}

export function areaLabel(area: CoverageArea): string {
  return area.area ? `${area.area}, ${area.city}` : area.city;
}
