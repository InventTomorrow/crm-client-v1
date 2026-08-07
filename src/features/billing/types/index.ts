export type PlanTier = 'STARTER' | 'GROWTH' | 'AGENCY' | 'RESELLER';
export type BusinessVertical = 'ECOMMERCE' | 'RESTAURANT' | 'MARKETING_AGENCY';
export type PlanDuration =
  | 'DAYS_3'
  | 'DAYS_7'
  | 'DAYS_14'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUAL'
  | 'ANNUAL'
  | 'CUSTOM_DAYS';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'SAFEPAY' | 'MANUAL';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  // Null = universal (applies to every vertical); non-null = scoped to one.
  businessVertical: BusinessVertical | null;

  maxWorkspaces: number;
  maxMembersPerWorkspace: number;
  maxChannels: number;

  // Only the field matching the tenant's own vertical is ever non-null for a
  // scoped plan; a universal plan carries all three.
  maxProducts: number | null;
  maxMenuItems: number | null;
  maxServices: number | null;

  maxMonthlyMessages: number;
  maxImageMessages: number;
  maxVoiceMessages: number;

  duration: PlanDuration;
  customDurationDays: number | null;
  isTrial: boolean;
  price: number;
  wholesalePrice: number;
  currency: string;

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

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  method: string | null;
  reference: string | null;
  receiptUrl: string | null;
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

export interface SupportContact {
  supportName: string | null;
  supportPhone: string | null;
  supportWhatsapp: string | null;
  supportEmail: string | null;
  paymentInstructions: string | null;
}

export interface CheckoutResponse {
  url: string;
  subscriptionId: string;
}
