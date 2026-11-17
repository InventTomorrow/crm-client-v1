// Mirrors server/src/modules/affiliates (affiliate-portal + affiliate-analytics).

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
}

export interface AffiliateProfile {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  commissionPercent: number;
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
  customerName: string;
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
