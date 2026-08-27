import type { z } from "zod";
import {
  clinicalServiceFormSchema,
  type ClinicalService,
  type ClinicalServiceFormValues,
} from "../types";

/** What react-hook-form holds: numbers arrive from text inputs as strings. */
export type ClinicalServiceFormInput = z.input<
  typeof clinicalServiceFormSchema
>;

/**
 * The only currency the product operates in today.
 *
 * Deliberately not a form field: the server still requires `currency`, so it
 * is carried through the form as a fixed value rather than asked for. When a
 * second currency becomes real, this is the one place to start.
 */
export const DEFAULT_CURRENCY = "PKR";

export const INITIAL_CLINICAL_SERVICE_FORM_VALUES: ClinicalServiceFormInput = {
  name: "",
  category: "",
  serviceType: "CONSULTATION",
  shortDescription: "",
  fullDescription: "",

  includedActivities: [],
  excludedActivities: [],
  conditionsTreated: [],

  pricingModel: "FIXED",
  price: "",
  priceMin: "",
  priceMax: "",
  firstSessionPrice: "",
  currency: DEFAULT_CURRENCY,
  pricingNote: "",

  durationMinutes: "",
  minServicePeriodDays: "",
  terminationNoticeDays: "",
  shiftOptions: [],
  advancePaymentPercent: "",
  advancePaymentNote: "",

  requiredStaffQualifications: [],
  safetyNote: "",

  requiresPractitioner: false,
  departmentKey: "",
  intakeFieldKeys: [],

  isPubliclyListed: true,
  isActive: true,
  displayOrder: 0,
};

/** A stored null reads back as an empty input, not the string "null". */
const text = (value: string | null): string => value ?? "";
const numeric = (value: number | null): string =>
  value == null ? "" : String(value);

export function toClinicalServiceFormValues(
  service: ClinicalService,
): ClinicalServiceFormInput {
  return {
    name: service.name,
    category: text(service.category),
    serviceType: service.serviceType,
    shortDescription: service.shortDescription,
    fullDescription: text(service.fullDescription),

    includedActivities: service.includedActivities,
    excludedActivities: service.excludedActivities,
    conditionsTreated: service.conditionsTreated,

    pricingModel: service.pricingModel,
    price: numeric(service.price),
    priceMin: numeric(service.priceMin),
    priceMax: numeric(service.priceMax),
    firstSessionPrice: numeric(service.firstSessionPrice),
    // Ignores whatever is stored: the product is single-currency, and echoing an
    // old value back would let a legacy row keep a currency nothing can edit.
    currency: DEFAULT_CURRENCY,
    pricingNote: text(service.pricingNote),

    durationMinutes: numeric(service.durationMinutes),
    minServicePeriodDays: numeric(service.minServicePeriodDays),
    terminationNoticeDays: numeric(service.terminationNoticeDays),
    shiftOptions: service.shiftOptions,
    advancePaymentPercent: numeric(service.advancePaymentPercent),
    advancePaymentNote: text(service.advancePaymentNote),

    requiredStaffQualifications: service.requiredStaffQualifications,
    safetyNote: text(service.safetyNote),

    requiresPractitioner: service.requiresPractitioner,
    departmentKey: text(service.departmentKey),
    intakeFieldKeys: service.intakeFieldKeys,

    isPubliclyListed: service.isPubliclyListed,
    isActive: service.isActive,
    displayOrder: service.displayOrder,
  };
}

/** The price inputs, so switching to "on enquiry" can blank all of them at once. */
export const PRICE_FIELDS = [
  "price",
  "priceMin",
  "priceMax",
  "firstSessionPrice",
] as const satisfies readonly (keyof ClinicalServiceFormValues)[];
