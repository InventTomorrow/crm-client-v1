import { z } from "zod";

export const LEAD_PRICED_DURATIONS = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
] as const;
export type LeadPricedDuration = (typeof LEAD_PRICED_DURATIONS)[number];

// Mirrors CUSTOM_PLAN_MIN_LEADS / CUSTOM_PLAN_MAX_LEADS in the server's lead-pricing.util.ts.
export const CUSTOM_PLAN_MIN_LEADS = 10;
export const CUSTOM_PLAN_MAX_LEADS = 100_000;

/** The public rates endpoint, validated before the page trusts it. */
export const leadPricingSchema = z.object({
  pricePerLead: z.number().positive(),
  messagesPerLead: z.number().int().positive(),
  baseFee: z.number().min(0),
  // Default so a server without discounts still renders the calculator at full price.
  quarterlyDiscountPercent: z.number().min(0).max(100).default(0),
  semiAnnualDiscountPercent: z.number().min(0).max(100).default(0),
  annualDiscountPercent: z.number().min(0).max(100).default(0),
  currency: z.string(),
  minLeads: z.number().int().positive(),
  maxLeads: z.number().int().positive(),
});
export type LeadPricing = z.infer<typeof leadPricingSchema>;

/** Mirrors submitCustomPlanRequestSchema in the server's public-custom-plan-request.dto.ts. */
export const customPlanRequestSchema = z.object({
  monthlyLeads: z
    .number({ message: "Enter how many leads you expect" })
    .int("Whole numbers only")
    .min(CUSTOM_PLAN_MIN_LEADS, `At least ${CUSTOM_PLAN_MIN_LEADS} leads`)
    .max(
      CUSTOM_PLAN_MAX_LEADS,
      `For more than ${CUSTOM_PLAN_MAX_LEADS.toLocaleString("en-PK")} leads, contact us`,
    ),
  duration: z.enum(LEAD_PRICED_DURATIONS),
  customerName: z.string().trim().min(1, "Enter your name").max(120),
  customerEmail: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email")
    .max(160),
  customerPhone: z
    .string()
    .trim()
    .min(5, "Enter a valid phone number")
    .max(30, "Enter a valid phone number"),
  businessName: z.string().trim().max(120),
  customerNote: z.string().trim().max(500, "Keep it under 500 characters"),
});
export type CustomPlanRequestFormValues = z.infer<typeof customPlanRequestSchema>;

export interface LeadPlanQuote {
  monthlyLeads: number;
  monthlyMessages: number;
  months: number;
  monthlyPrice: number;
  listPrice: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
  effectiveMonthlyPrice: number;
}

export interface CustomPlanRequestResponse {
  requestId: string;
  quote: LeadPlanQuote & { currency: string };
}
