import type { Plan, SupportContact } from "@/features/billing/types";

export type { SupportContact };

/** Prefill the admin attached when generating the link — all optional. */
export interface SubscriptionCheckoutPrefill {
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
}

/** A bank / wallet account the customer transfers the plan price into. */
export interface PublicPaymentAccount {
  id: string;
  label: string;
  method: PaymentMethod;
  accountTitle: string;
  accountNumber: string;
  bankName: string | null;
  iban: string | null;
  branchCode: string | null;
  instructions: string | null;
}

/** GET /subscribe/:token — public, unauthenticated. */
export interface PublicSubscriptionLink {
  plan: Plan;
  prefill: SubscriptionCheckoutPrefill;
  supportContact: SupportContact;
  /** Only the accounts an admin left active, in their configured order. */
  paymentAccounts: PublicPaymentAccount[];
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
  paymentAmount: number;
  currency: string;
  /** Omitted for free/trial plans — the server enforces it for paid ones. */
  receiptUrl?: string;
}

export interface SubmitSubscriptionResult {
  status: "PENDING_APPROVAL";
}
