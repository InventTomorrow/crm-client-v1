import type { Plan, SupportContact } from "@/features/billing/types";

export type { SupportContact };

/** Prefill the admin attached when generating the link — all optional. */
export interface SubscriptionCheckoutPrefill {
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
}

/** GET /subscribe/:token — public, unauthenticated. */
export interface PublicSubscriptionLink {
  plan: Plan;
  prefill: SubscriptionCheckoutPrefill;
  supportContact: SupportContact;
}

export const PAYMENT_METHODS = [
  "BANK_TRANSFER",
  "EASYPAISA",
  "JAZZCASH",
  "CASH",
  "OTHER",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Bank transfer",
  EASYPAISA: "Easypaisa",
  JAZZCASH: "JazzCash",
  CASH: "Cash",
  OTHER: "Other",
};

/** POST /subscribe/:token/submit */
export interface SubmitSubscriptionPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessName?: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentAmount: number;
  currency: string;
  receiptUrl: string;
  customerNote?: string;
}

export interface SubmitSubscriptionResult {
  status: "PENDING_APPROVAL";
}
