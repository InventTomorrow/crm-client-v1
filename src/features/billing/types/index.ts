export type PlanTier = 'STARTER' | 'GROWTH' | 'AGENCY' | 'RESELLER';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';
export type PaymentProvider = 'SAFEPAY';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  priceMonthly: number;
  maxWorkspaces: number;
  maxMembersPerWorkspace: number;
  maxMonthlyMessages: number;
  maxChannels: number;
  canResell: boolean;
  canWhitelabel: boolean;
  providerPlanId: string | null;
  isPublic: boolean;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  providerSubscriptionId: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  createdAt: string;
  plan?: Plan | null;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  periodStart: string | null;
  periodEnd: string | null;
  issuedAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  brand: string | null;
  last4: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
}

export interface CheckoutResponse {
  url: string;
  subscriptionId: string;
}
