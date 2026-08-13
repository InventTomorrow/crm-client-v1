import { apiClient } from '@/lib/apiClient';
import type {
  CheckoutResponse,
  EntitlementStatus,
  MessageAllowance,
  Payment,
  PaymentMethod,
  Plan,
  PlanChangeResult,
  PlanRequest,
  PlanUsage,
  Subscription,
  SupportContact,
  WorkspaceAllowance,
} from '../types';

export async function getPlans() {
  const res = await apiClient.get<{ success: true; data: Plan[] }>('/billing/plans');
  return res.data.data;
}

export async function getSupportContact() {
  const res = await apiClient.get<{ success: true; data: SupportContact }>('/billing/support-contact');
  return res.data.data;
}

export async function getUsage() {
  const res = await apiClient.get<{ success: true; data: PlanUsage | null }>('/billing/usage');
  return res.data.data;
}

export async function getMessageAllowance() {
  const res = await apiClient.get<{ success: true; data: MessageAllowance | null }>(
    '/billing/message-allowance',
  );
  return res.data.data;
}

export async function getWorkspaceAllowance() {
  const res = await apiClient.get<{ success: true; data: WorkspaceAllowance }>(
    '/billing/workspace-allowance',
  );
  return res.data.data;
}

export async function getEntitlementStatus() {
  const res = await apiClient.get<{ success: true; data: EntitlementStatus }>(
    '/billing/entitlement',
  );
  return res.data.data;
}

export async function getSubscription() {
  const res = await apiClient.get<{ success: true; data: Subscription | null }>(
    '/billing/subscription',
  );
  return res.data.data;
}

export async function getMyPlanRequest() {
  const res = await apiClient.get<{ success: true; data: PlanRequest | null }>(
    '/billing/plan-request',
  );
  return res.data.data;
}

/**
 * Self-serve workflow 2: mints this workspace's own /subscribe/:token link so
 * the customer can fill their details and upload a payment receipt.
 */
export async function createSelfServeCheckoutLink(planId: string) {
  const res = await apiClient.post<{ success: true; data: { checkoutUrl: string; token: string } }>(
    '/billing/checkout-link',
    { planId },
  );
  return res.data.data;
}

export async function createCheckout(planId: string) {
  const res = await apiClient.post<{ success: true; data: CheckoutResponse }>(
    '/billing/checkout',
    { planId },
  );
  return res.data.data;
}

/**
 * Upgrade or downgrade. Upgrades need paying for first, so they come back as a
 * checkout redirect; downgrades are booked for period end and return the
 * updated subscription straight away.
 */
export async function changePlan(planId: string) {
  const res = await apiClient.post<{ success: true; data: PlanChangeResult }>(
    '/billing/subscription/change',
    { planId },
  );
  return res.data.data;
}

export async function cancelSubscription() {
  const res = await apiClient.post<{ success: true; data: Subscription }>(
    '/billing/subscription/cancel',
  );
  return res.data.data;
}

/** Clears a scheduled downgrade or cancellation before it takes effect. */
export async function reactivateSubscription() {
  const res = await apiClient.post<{ success: true; data: Subscription }>(
    '/billing/subscription/reactivate',
  );
  return res.data.data;
}

export async function getPayments() {
  const res = await apiClient.get<{ success: true; data: Payment[] }>('/billing/payments');
  return res.data.data;
}

export async function getPaymentMethods() {
  const res = await apiClient.get<{ success: true; data: PaymentMethod[] }>(
    '/billing/payment-methods',
  );
  return res.data.data;
}
