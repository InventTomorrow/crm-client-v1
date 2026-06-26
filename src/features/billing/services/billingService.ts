import { apiClient } from '@/lib/apiClient';
import type {
  CheckoutResponse,
  Invoice,
  Payment,
  PaymentMethod,
  Plan,
  Subscription,
} from '../types';

export async function getPlans() {
  const res = await apiClient.get<{ success: true; data: Plan[] }>('/billing/plans');
  return res.data.data;
}

export async function getSubscription() {
  const res = await apiClient.get<{ success: true; data: Subscription | null }>(
    '/billing/subscription',
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

export async function pauseSubscription() {
  const res = await apiClient.post<{ success: true; data: Subscription }>(
    '/billing/subscription/pause',
  );
  return res.data.data;
}

export async function resumeSubscription() {
  const res = await apiClient.post<{ success: true; data: Subscription }>(
    '/billing/subscription/resume',
  );
  return res.data.data;
}

export async function getInvoices() {
  const res = await apiClient.get<{ success: true; data: Invoice[] }>('/billing/invoices');
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
