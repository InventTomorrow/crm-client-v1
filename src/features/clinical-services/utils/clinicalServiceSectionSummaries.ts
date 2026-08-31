import {
  PRICING_MODEL_LABELS,
  SERVICE_TYPE_LABELS,
  type ClinicalServiceFormValues,
} from "../types";
import {
  DEFAULT_CURRENCY,
  type ClinicalServiceFormInput,
} from "./clinicalServiceFormMapping";

/** Shown on a collapsed trigger when a section has nothing worth reporting yet. */
export const NOTHING_FILLED_IN = "Not filled in yet";

/** Every section of the clinical service form, in the order it is rendered. */
export type ClinicalServiceSectionId =
  | "basics"
  | "scope"
  | "intake"
  | "pricing"
  | "terms"
  | "safety"
  | "visibility";

/**
 * Which fields each section owns.
 *
 * Used to reopen a collapsed section that failed validation — a required field
 * hidden behind a closed trigger would otherwise reject the save with no
 * visible reason.
 */
export const SECTION_FIELDS: Record<
  ClinicalServiceSectionId,
  readonly (keyof ClinicalServiceFormValues)[]
> = {
  basics: [
    "name",
    "serviceType",
    "category",
    "departmentKey",
    "shortDescription",
    "fullDescription",
  ],
  scope: ["includedActivities", "excludedActivities", "conditionsTreated"],
  intake: ["intakeFieldKeys"],
  pricing: [
    "pricingModel",
    "currency",
    "price",
    "priceMin",
    "priceMax",
    "firstSessionPrice",
    "pricingNote",
    "shiftOptions",
  ],
  terms: [
    "durationMinutes",
    "minServicePeriodDays",
    "terminationNoticeDays",
    "advancePaymentPercent",
    "advancePaymentNote",
  ],
  safety: ["requiredStaffQualifications", "safetyNote"],
  visibility: ["isPubliclyListed", "requiresPractitioner", "isActive"],
};

const filled = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim().length > 0;

const count = (values: unknown[] | undefined): number => values?.length ?? 0;

/** "a, b and c" — an empty list yields an empty string, never a stray joiner. */
const joinParts = (parts: (string | null)[]): string =>
  parts.filter((part): part is string => Boolean(part)).join(" · ");

const plural = (n: number, singular: string, pluralWord = `${singular}s`) =>
  `${n} ${n === 1 ? singular : pluralWord}`;

function summariseBasics(values: ClinicalServiceFormInput): string {
  const name = filled(values.name) ? String(values.name).trim() : null;
  const type = values.serviceType
    ? SERVICE_TYPE_LABELS[values.serviceType]
    : null;

  return joinParts([name, type]) || NOTHING_FILLED_IN;
}

function summariseScope(values: ClinicalServiceFormInput): string {
  const included = count(values.includedActivities);
  const excluded = count(values.excludedActivities);
  const conditions = count(values.conditionsTreated);

  if (included + excluded + conditions === 0) return "Nothing listed yet";

  return joinParts([
    included > 0 ? `${included} included` : null,
    excluded > 0 ? `${excluded} excluded` : null,
    conditions > 0 ? plural(conditions, "condition") : null,
  ]);
}

/**
 * Reads the way the assistant would: an on-enquiry service reports that it is
 * unquotable rather than showing whatever figure is still sitting in state.
 */
/**
 * Counts only what this service opts into. The always-asked questions are put to
 * every enquiry, so folding them in would report the workspace baseline as
 * configuration that had been done on this service.
 */
function summariseIntake(values: ClinicalServiceFormInput): string {
  const extra = count(values.intakeFieldKeys);
  return extra === 0
    ? "Always-asked questions only"
    : `Always-asked questions + ${plural(extra, "extra")}`;
}

function summarisePricing(values: ClinicalServiceFormInput): string {
  const money = (amount: unknown) =>
    `${DEFAULT_CURRENCY} ${Number(amount).toLocaleString()}`;

  const shifts = count(values.shiftOptions);
  const shiftLabel = shifts > 0 ? plural(shifts, "arrangement") : null;

  if (values.pricingModel === "ON_ENQUIRY") {
    return joinParts(["Quoted by a coordinator", shiftLabel]);
  }

  const model = values.pricingModel
    ? PRICING_MODEL_LABELS[values.pricingModel]
    : null;

  let price: string | null = null;
  if (values.pricingModel === "RANGE") {
    price =
      filled(values.priceMin) && filled(values.priceMax)
        ? `${money(values.priceMin)}–${Number(values.priceMax).toLocaleString()}`
        : null;
  } else if (filled(values.price)) {
    price = money(values.price);
  }

  return (
    joinParts([price, price ? null : model, shiftLabel]) || NOTHING_FILLED_IN
  );
}

function summariseTerms(values: ClinicalServiceFormInput): string {
  return (
    joinParts([
      filled(values.durationMinutes) ? `${values.durationMinutes} min` : null,
      filled(values.minServicePeriodDays)
        ? `min ${values.minServicePeriodDays} days`
        : null,
      filled(values.terminationNoticeDays)
        ? `${values.terminationNoticeDays} days notice`
        : null,
      filled(values.advancePaymentPercent)
        ? `${values.advancePaymentPercent}% advance`
        : null,
    ]) || NOTHING_FILLED_IN
  );
}

function summariseSafety(values: ClinicalServiceFormInput): string {
  const qualifications = count(values.requiredStaffQualifications);

  return (
    joinParts([
      qualifications > 0 ? plural(qualifications, "qualification") : null,
      filled(values.safetyNote) ? "Safety note set" : null,
    ]) || NOTHING_FILLED_IN
  );
}

/** Always reports something — every toggle has a meaning in both positions. */
function summariseVisibility(values: ClinicalServiceFormInput): string {
  return joinParts([
    values.isPubliclyListed ? "Listed" : "On enquiry",
    values.requiresPractitioner ? "Named practitioner" : null,
    values.isActive ? "Active" : "Inactive",
  ]);
}

const SUMMARISERS: Record<
  ClinicalServiceSectionId,
  (values: ClinicalServiceFormInput) => string
> = {
  basics: summariseBasics,
  scope: summariseScope,
  intake: summariseIntake,
  pricing: summarisePricing,
  terms: summariseTerms,
  safety: summariseSafety,
  visibility: summariseVisibility,
};

/** The one-line recap shown on a section's accordion trigger. */
export function summariseSection(
  sectionId: ClinicalServiceSectionId,
  values: ClinicalServiceFormInput,
): string {
  return SUMMARISERS[sectionId](values);
}

/** Sections holding at least one field that failed validation. */
export function sectionsWithErrors(
  erroredFields: string[],
): ClinicalServiceSectionId[] {
  const failed = new Set(erroredFields);

  return (Object.keys(SECTION_FIELDS) as ClinicalServiceSectionId[]).filter(
    (sectionId) => SECTION_FIELDS[sectionId].some((field) => failed.has(field)),
  );
}
