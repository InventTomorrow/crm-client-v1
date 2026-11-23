import type { LeadPlanQuote, LeadPricedDuration, LeadPricing } from "../types";

// Mirrors the server's getLeadPlanQuote; display only, the server prices every request itself.
const DURATION_MONTHS: Record<LeadPricedDuration, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  ANNUAL: 12,
};

export const DURATION_LABEL: Record<LeadPricedDuration, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "3 months",
  SEMI_ANNUAL: "6 months",
  ANNUAL: "Yearly",
};

const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;

export function getDurationDiscountPercent(
  duration: LeadPricedDuration,
  leadPricing: LeadPricing,
): number {
  switch (duration) {
    case "QUARTERLY":
      return leadPricing.quarterlyDiscountPercent;
    case "SEMI_ANNUAL":
      return leadPricing.semiAnnualDiscountPercent;
    case "ANNUAL":
      return leadPricing.annualDiscountPercent;
    default:
      return 0;
  }
}

export function getLeadPlanQuote(
  monthlyLeads: number,
  duration: LeadPricedDuration,
  leadPricing: LeadPricing,
): LeadPlanQuote {
  const months = DURATION_MONTHS[duration];
  const monthlyPrice = roundMoney(
    monthlyLeads * leadPricing.pricePerLead + leadPricing.baseFee,
  );
  const listPrice = roundMoney(monthlyPrice * months);
  const discountPercent = getDurationDiscountPercent(duration, leadPricing);
  const discountAmount = roundMoney((listPrice * discountPercent) / 100);
  const totalPrice = roundMoney(listPrice - discountAmount);
  return {
    monthlyLeads,
    monthlyMessages: monthlyLeads * leadPricing.messagesPerLead,
    months,
    monthlyPrice,
    listPrice,
    discountPercent,
    discountAmount,
    totalPrice,
    effectiveMonthlyPrice: roundMoney(totalPrice / months),
  };
}

export function formatRupees(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
}
