import { apiClient } from '@/lib/apiClient';
import type {
  CheckoutResponse,
  Payment,
  PaymentMethod,
  Plan,
  Subscription,
  SupportContact,
} from '../types';

export async function getPlans() {
  const res = await apiClient.get<{ success: true; data: Plan[] }>('/billing/plans');
  return res.data.data;
}

export async function getSupportContact() {
  const res = await apiClient.get<{ success: true; data: SupportContact }>('/billing/support-contact');
  return res.data.data;
}

export async function getSubscription() {
  const res = await apiClient.get<{ success: true; data: Subscription | null }>(
    '/billing/subscription',
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

export async function cancelSubscription() {
  const res = await apiClient.post<{ success: true; data: Subscription }>(
    '/billing/subscription/cancel',
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
