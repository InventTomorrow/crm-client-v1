import { EMPTY_LIST_ROW } from "@/lib/validationMessages";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

/**
 * Mirrors what `GET /clinical-services/:id/preview` returns — the server
 * renders it with the same formatters the AI tools use, so the preview cannot
 * drift from what the assistant actually says.
 */
export interface ClinicalServiceAssistantPreview {
  summary: {
    serviceId: string;
    name: string;
    category: string | null;
    serviceType: ClinicalServiceType;
    shortDescription: string | null;
    price: string;
    priceIsQuotable: boolean;
    pricingNote: string | null;
    durationMinutes: number | null;
    minServicePeriodDays: number | null;
    requiresPractitioner: boolean;
  };
  pricing: { display: string; quotable: boolean; note: string | null };
  shiftOptions: {
    key: string;
    label: string;
    hoursPerDay: number | null;
    price: string;
    billingPeriod: string;
    availableCities: string[];
  }[];
  includedActivities: string[];
  excludedActivities: string[];
  conditionsTreated: string[];
  safetyNote: string | null;
  intakeFieldKeys: string[];
  isPubliclyListed: boolean;
  isActive: boolean;
}

/** Mirrors `ClinicalServiceType` on the server. */
export const CLINICAL_SERVICE_TYPES = [
  "CONSULTATION",
  "PROCEDURE",
  "THERAPY_SESSION",
  "HOME_VISIT",
  "STAFF_DEPLOYMENT",
  "RESIDENTIAL",
  "DIAGNOSTIC",
  "OTHER",
] as const;
export type ClinicalServiceType = (typeof CLINICAL_SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABELS: Record<ClinicalServiceType, string> = {
  CONSULTATION: "Consultation",
  PROCEDURE: "Procedure",
  THERAPY_SESSION: "Therapy session",
  HOME_VISIT: "Home visit",
  STAFF_DEPLOYMENT: "Staff deployment",
  RESIDENTIAL: "Residential",
  DIAGNOSTIC: "Diagnostic",
  OTHER: "Other",
};

/** Mirrors `ClinicalPricingModel` on the server. */
export const CLINICAL_PRICING_MODELS = [
  "FIXED",
  "RANGE",
  "PER_SESSION",
  "PER_SHIFT",
  "PER_DAY",
  "PER_MONTH",
  "ON_ENQUIRY",
] as const;
export type ClinicalPricingModel = (typeof CLINICAL_PRICING_MODELS)[number];

export const PRICING_MODEL_LABELS: Record<ClinicalPricingModel, string> = {
  FIXED: "Fixed price",
  RANGE: "Price range",
  PER_SESSION: "Per session",
  PER_SHIFT: "Per shift",
  PER_DAY: "Per day",
  PER_MONTH: "Per month",
  ON_ENQUIRY: "On enquiry (never quoted by the assistant)",
};

/** Mirrors `ShiftBillingPeriod` on the server. */
export const SHIFT_BILLING_PERIODS = [
  "PER_VISIT",
  "PER_DAY",
  "PER_MONTH",
] as const;
export type ShiftBillingPeriod = (typeof SHIFT_BILLING_PERIODS)[number];

export const BILLING_PERIOD_LABELS: Record<ShiftBillingPeriod, string> = {
  PER_VISIT: "per visit",
  PER_DAY: "per day",
  PER_MONTH: "per month",
};

/**
 * A number input that may legitimately be left empty.
 *
 * `z.coerce.number()` reads an empty string as 0, so a blank "Minimum period"
 * would be saved as a real zero rather than "not set". Blank is mapped to null
 * before coercion, which is also what lets these fields be bound straight to a
 * text input by react-hook-form.
 */
type NumericFieldInput = string | number | null | undefined;

const optionalNumber = (schema: z.ZodType<number, unknown>) =>
  z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? null : value,
    schema.nullable(),
  ) as unknown as z.ZodType<number | null, NumericFieldInput>;

/** Mirrors `serviceShiftOptionSchema` on the server. */
export const shiftOptionSchema = z
  .object({
    key: z.string().trim().min(1, "Key is required"),
    label: z.string().trim().min(1, "Label is required"),
    hoursPerDay: z.coerce.number().int().min(1).max(24).nullable().optional(),
    price: z.coerce.number().min(0).nullable().optional(),
    priceMin: z.coerce.number().min(0).nullable().optional(),
    priceMax: z.coerce.number().min(0).nullable().optional(),
    billingPeriod: z.enum(SHIFT_BILLING_PERIODS).default("PER_MONTH"),
    /** Empty means offered wherever the service itself is covered. */
    availableCities: z.array(z.string().trim().min(1)).default([]),
    isDefault: z.boolean().default(false),
  })
  .refine(
    (shift) =>
      shift.priceMin == null ||
      shift.priceMax == null ||
      shift.priceMin <= shift.priceMax,
    { path: ["priceMax"], message: "Max must be at least min" },
  );
export type ShiftOption = z.infer<typeof shiftOptionSchema>;

/** What the shift editor actually holds — defaults are still unresolved there. */
export type ShiftOptionInput = z.input<typeof shiftOptionSchema>;

/**
 * Mirrors `createClinicalServiceSchema` on the server, including its pricing
 * rules — a RANGE service needs both ends of the band, and an ON_ENQUIRY
 * service must carry no price at all so the assistant cannot read one out.
 */
export const clinicalServiceFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    category: z.string().trim().optional(),
    serviceType: z.enum(CLINICAL_SERVICE_TYPES),
    shortDescription: z.string().trim().min(1, "Short description is required"),
    fullDescription: z.string().trim().optional(),

    includedActivities: z
      .array(z.string().trim().min(1, EMPTY_LIST_ROW))
      .default([]),
    excludedActivities: z
      .array(z.string().trim().min(1, EMPTY_LIST_ROW))
      .default([]),
    conditionsTreated: z
      .array(z.string().trim().min(1, EMPTY_LIST_ROW))
      .default([]),

    pricingModel: z.enum(CLINICAL_PRICING_MODELS),
    price: optionalNumber(z.coerce.number().min(0)),
    priceMin: optionalNumber(z.coerce.number().min(0)),
    priceMax: optionalNumber(z.coerce.number().min(0)),
    firstSessionPrice: optionalNumber(z.coerce.number().min(0)),
    currency: z.string().trim().length(3).default("PKR"),
    pricingNote: z.string().trim().optional(),

    durationMinutes: optionalNumber(z.coerce.number().int().min(1).max(1440)),
    minServicePeriodDays: optionalNumber(z.coerce.number().int().min(0)),
    terminationNoticeDays: optionalNumber(z.coerce.number().int().min(0)),
    shiftOptions: z.array(shiftOptionSchema).default([]),
    advancePaymentPercent: optionalNumber(
      z.coerce.number().int().min(0).max(100),
    ),
    advancePaymentNote: z.string().trim().optional(),

    requiredStaffQualifications: z
      .array(z.string().trim().min(1, EMPTY_LIST_ROW))
      .default([]),
    safetyNote: z.string().trim().optional(),

    requiresPractitioner: z.boolean().default(false),
    departmentKey: z.string().trim().optional(),
    // Keys of the workspace's own intake questions, so there is no fixed set to
    // validate against here — the server rejects one it does not own.
    intakeFieldKeys: z.array(z.string().trim().min(1)).default([]),

    isPubliclyListed: z.boolean().default(true),
    isActive: z.boolean().default(true),
    displayOrder: z.coerce.number().int().default(0),
  })
  .superRefine((value, ctx) => {
    if (value.pricingModel === "RANGE") {
      if (value.priceMin == null || value.priceMax == null) {
        ctx.addIssue({
          code: "custom",
          path: ["priceMin"],
          message: "A price range needs both a minimum and a maximum",
        });
      } else if (value.priceMin > value.priceMax) {
        ctx.addIssue({
          code: "custom",
          path: ["priceMax"],
          message: "Maximum must be at least the minimum",
        });
      }
      return;
    }

    if (value.pricingModel === "ON_ENQUIRY") {
      for (const field of ["price", "priceMin", "priceMax"] as const) {
        if (value[field] != null) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message:
              "An on-enquiry service must not carry a price — a coordinator quotes it",
          });
        }
      }
    }
  });

export type ClinicalServiceFormValues = z.infer<
  typeof clinicalServiceFormSchema
>;

/** Numbers reach the form as text, so the input and output shapes differ. */
export type ClinicalServiceForm = UseFormReturn<
  z.input<typeof clinicalServiceFormSchema>,
  unknown,
  ClinicalServiceFormValues
>;

/** Shared by every field group the clinical service form renders. */
export interface ClinicalServiceFormSectionProps {
  form: ClinicalServiceForm;
  isSaving: boolean;
}

export interface ClinicalService {
  id: string;
  tenantId: string;
  name: string;
  category: string | null;
  serviceType: ClinicalServiceType;
  shortDescription: string;
  fullDescription: string | null;
  imageUrls: string[];

  includedActivities: string[];
  excludedActivities: string[];
  conditionsTreated: string[];

  pricingModel: ClinicalPricingModel;
  price: number | null;
  priceMin: number | null;
  priceMax: number | null;
  firstSessionPrice: number | null;
  currency: string;
  pricingNote: string | null;

  durationMinutes: number | null;
  minServicePeriodDays: number | null;
  terminationNoticeDays: number | null;
  shiftOptions: ShiftOption[];
  advancePaymentPercent: number | null;
  advancePaymentNote: string | null;

  requiredStaffQualifications: string[];
  safetyNote: string | null;

  requiresPractitioner: boolean;
  departmentKey: string | null;
  intakeFieldKeys: string[];

  isPubliclyListed: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalServiceFilters {
  search?: string;
  category?: string;
  serviceType?: ClinicalServiceType;
  isActive?: boolean;
  isPubliclyListed?: boolean;
}

/** How a service's price reads in the list — mirrors the server's pricing presenter. */
export function formatServicePrice(service: ClinicalService): string {
  const money = (amount: number) =>
    `${service.currency} ${amount.toLocaleString()}`;

  switch (service.pricingModel) {
    case "ON_ENQUIRY":
      return "On enquiry";
    case "RANGE":
      return service.priceMin != null && service.priceMax != null
        ? `${service.currency} ${service.priceMin.toLocaleString()}–${service.priceMax.toLocaleString()}`
        : "On enquiry";
    case "PER_SESSION": {
      const parts = [];
      if (service.firstSessionPrice != null) {
        parts.push(`First ${money(service.firstSessionPrice)}`);
      }
      if (service.price != null) parts.push(`${money(service.price)}/session`);
      return parts.join(", ") || "On enquiry";
    }
    default:
      return service.price != null ? money(service.price) : "On enquiry";
  }
}
