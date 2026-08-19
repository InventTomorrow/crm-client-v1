// TRIAL is paired with the plan's isTrial flag — the two always agree.
export type PlanTier = 'TRIAL' | 'STARTER' | 'GROWTH' | 'AGENCY' | 'RESELLER';
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
// PENDING is an unpaid gateway checkout handoff — the API never returns one
// as the current subscription, but the union mirrors the server enum.
export type SubscriptionStatus = 'PENDING' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'SAFEPAY' | 'MANUAL';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  // Null = universal (applies to every vertical); non-null = scoped to one.
  businessVertical: BusinessVertical | null;

  // Every max* below is a count, or -1 when the plan leaves it uncapped —
  // render them through formatPlanLimit (utils/planLimits) rather than raw.
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

  // Platform campaign pricing, applied server-side. Null when no campaign is
  // running or the plan is a free trial. `price` deliberately stays the list
  // price so upgrade/downgrade comparisons are unaffected by a campaign.
  offerPrice: number | null;
  offerDiscountPercent: number | null;
  offerEndsAt: string | null;

  canResell: boolean;
  canWhitelabel: boolean;
  providerPlanId: string | null;
  isPublic: boolean;
  isActive: boolean;

  // Landing-page marketing fields, set in admin under "Landing page display".
  ctaLabel: string | null;
  features: string[];
  isFeatured: boolean;
  isComingSoon: boolean;
}

/** A downgrade or cancellation the customer booked for the end of the paid period. */
export type PendingChangeType = 'DOWNGRADE' | 'CANCEL';

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
  pendingChangeType: PendingChangeType | null;
  pendingPlanId: string | null;
  pendingChangeEffectiveAt: string | null;
  createdAt: string;
  plan?: Plan | null;
  pendingPlan?: Plan | null;
}

/** Upgrades redirect to checkout; downgrades apply to the subscription in place. */
export type PlanChangeResult =
  | { type: 'redirect'; url: string }
  | { type: 'updated'; subscription: Subscription };

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

export type PlanRequestStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

/** GET /billing/plan-request — latest manual plan request this account submitted. */
export interface PlanRequest {
  id: string;
  planId: string;
  status: PlanRequestStatus;
  paymentAmount: number;
  currency: string;
  createdAt: string;
  reviewedAt: string | null;
  plan: { id: string; name: string };
}

export interface CheckoutResponse {
  url: string;
  subscriptionId: string;
}

/** GET /billing/usage — consumption vs the plan's limits for this period. */
export interface UsageMetric {
  key: string;
  label: string;
  used: number;
  /** -1 when the plan leaves this metric uncapped. */
  limit: number;
}

export interface PlanUsage {
  periodStart: string;
  periodEnd: string | null;
  plan: { id: string; name: string; isTrial: boolean };
  metrics: UsageMetric[];
}

/** GET /billing/message-allowance — send quotas for the inbox composer. */
export interface MessageAllowanceMetric {
  used: number;
  limit: number;
  exhausted: boolean;
}

export interface MessageAllowance {
  messages: MessageAllowanceMetric;
  imageMessages: MessageAllowanceMetric;
  voiceMessages: MessageAllowanceMetric;
}

/** GET /billing/workspace-allowance — slots used vs the plan's workspace cap. */
export interface WorkspaceAllowance {
  used: number;
  limit: number | null;
  canCreate: boolean;
}

/** GET /billing/entitlement — whether this workspace is usable at all. */
export interface EntitlementStatus {
  live: boolean;
  reason: 'ok' | 'expired' | 'none';
  planName: string | null;
  currentPeriodEnd: string | null;
}
