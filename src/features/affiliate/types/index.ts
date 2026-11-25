// Mirrors server/src/modules/affiliates (portal, analytics, join, applications).
import { passwordSchema } from "@/features/auth/types";
import { REFERRAL_CODE_PATTERN } from "@/features/referrals/types";
import { z } from "zod";

export const ANALYTICS_RANGE_PRESETS = ["7d", "30d", "90d", "365d"] as const;
export type AnalyticsRangePreset = (typeof ANALYTICS_RANGE_PRESETS)[number];

export interface AffiliateShareCode {
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiresAt: string | null;
  maxRedemptions: number | null;
  uses: number;
  shareUrl: string;
  createdByAffiliate: boolean;
}

export interface AffiliateProfile {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  commissionPercent: number;
  /** Highest discount on codes they create themselves; null = the admin hasn't allowed it. */
  selfServeMaxDiscountPercent: number | null;
  selfServeCodeLimit: number;
  codes: AffiliateShareCode[];
}

export interface AffiliatePeriodTotals {
  signups: number;
  conversions: number;
  conversionRate: number | null;
  revenue: number;
  discountGiven: number;
  commissionEarned: number;
}

export interface AffiliateTrendPoint {
  bucket: string;
  signups: number;
  conversions: number;
  revenue: number;
  commission: number;
}

export interface AffiliateAnalytics {
  range: { from: string; to: string };
  granularity: "day" | "month";
  currency: string;
  totals: AffiliatePeriodTotals;
  previousTotals: AffiliatePeriodTotals;
  lifetime: {
    signups: number;
    conversions: number;
    conversionRate: number | null;
    revenue: number;
    commissionEarned: number;
    commissionPaid: number;
    commissionOwed: number;
  };
  trend: AffiliateTrendPoint[];
  byPlan: { planName: string; conversions: number; revenue: number }[];
  byCode: {
    codeId: string;
    code: string;
    discountPercent: number;
    signups: number;
    conversions: number;
    revenue: number;
    commission: number;
  }[];
}

export interface AffiliateReferredCustomer {
  id: string;
  status: "SIGNED_UP" | "CONVERTED";
  /** Name and photo only; the server never sends a referred customer's contact details. */
  customerName: string;
  customerAvatarUrl: string | null;
  code: string;
  planName: string | null;
  paidAmount: number | null;
  commissionAmount: number | null;
  currency: string;
  isCommissionPaid: boolean;
  createdAt: string;
  convertedAt: string | null;
}

export interface AffiliateReferralsPage {
  items: AffiliateReferredCustomer[];
  meta: { page: number; limit: number; total: number };
}

// Join links (server: affiliates/join).
export type AffiliateJoinMethod = "SET_PASSWORD" | "SIGNUP";

export type AffiliateInvitePreview =
  | { status: "VALID"; method: AffiliateJoinMethod; name: string; email: string; phone: string | null }
  | { status: "NOT_FOUND" | "EXPIRED" };

export type ValidAffiliateInvite = Extract<AffiliateInvitePreview, { status: "VALID" }>;

/** A SIGNUP link also asks for the person's own name; a SET_PASSWORD link only for a password. */
export function buildAffiliateJoinSchema(method: AffiliateJoinMethod) {
  return z
    .object({
      firstName:
        method === "SIGNUP"
          ? z.string().trim().min(1, "First name is required").max(60)
          : z.string(),
      lastName: z.string().trim().max(60),
      phone: z.string().trim().max(30),
      password: passwordSchema,
      confirmPassword: z.string().min(1, "Please confirm your password"),
      acceptTerms: z.boolean().refine((accepted) => accepted, {
        message: "Please accept the Terms and Privacy Policy to continue",
      }),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
}

export type AffiliateJoinFormValues = z.infer<ReturnType<typeof buildAffiliateJoinSchema>>;

// Public application form (server: affiliates/applications).
export const affiliateApplicationSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((phone) => phone === "" || phone.length >= 7, "Enter a valid phone number"),
  website: z
    .string()
    .trim()
    .max(300)
    .refine((link) => link === "" || /^https?:\/\/\S+\.\S+/.test(link), "Enter a full link starting with https://"),
  message: z.string().trim().min(20, "Tell us a bit more").max(2000),
});

export type AffiliateApplicationInput = z.infer<typeof affiliateApplicationSchema>;

// Codes the affiliate creates (server: affiliates/portal). The server enforces the same cap.
export function buildOwnCodeSchema(maxDiscountPercent: number) {
  return z.object({
    code: z
      .string()
      .trim()
      .refine((code) => code === "" || REFERRAL_CODE_PATTERN.test(code), "Use 3 to 20 letters or numbers, no spaces"),
    discountPercent: z
      .number()
      .int()
      .min(1, "At least 1%")
      .max(maxDiscountPercent, `Your codes can give at most ${maxDiscountPercent}% off`),
  });
}

export type OwnCodeFormValues = z.infer<ReturnType<typeof buildOwnCodeSchema>>;
