'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  cancelSubscription,
  createCheckout,
  createSelfServeCheckoutLink,
  getPayments,
  getPlans,
  getSubscription,
  getSupportContact,
} from '../services/billingService';
import type { Subscription } from '../types';

const keys = {
  all: ['billing'] as const,
  plans: ['billing', 'plans'] as const,
  supportContact: ['billing', 'support-contact'] as const,
  subscription: ['billing', 'subscription'] as const,
  payments: ['billing', 'payments'] as const,
};

export function usePlans() {
  return useQuery({ queryKey: keys.plans, queryFn: getPlans, staleTime: 5 * 60 * 1000 });
}

/** Admin support contact + payment instructions — the MANUAL-mode CTA target. */
export function useSupportContact() {
  return useQuery({ queryKey: keys.supportContact, queryFn: getSupportContact, staleTime: 5 * 60 * 1000 });
}

/**
 * Current subscription. `pollUntilActive` enables a short refetch loop used on
 * the post-checkout return page — activation is confirmed by the webhook, not
 * the redirect, so the UI polls until the status flips to ACTIVE.
 */
export function useSubscription(pollUntilActive = false) {
  return useQuery({
    queryKey: keys.subscription,
    queryFn: getSubscription,
    refetchInterval: pollUntilActive
      ? (query) => {
          const data = query.state.data as Subscription | null | undefined;
          return data?.status === 'ACTIVE' ? false : 4000;
        }
      : false,
  });
}

export function usePayments() {
  return useQuery({ queryKey: keys.payments, queryFn: getPayments });
}

/**
 * Self-serve workflow 2 — sends the customer to their own tokenized
 * /subscribe/:token page to enter details and upload a payment receipt.
 */
export function useRequestPlan() {
  return useMutation({
    mutationFn: (planId: string) => createSelfServeCheckoutLink(planId),
    onSuccess: ({ checkoutUrl }) => {
      window.location.assign(checkoutUrl);
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not start your request')),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (planId: string) => createCheckout(planId),
    onSuccess: ({ url }) => {
      // Hand off to the Safepay hosted checkout.
      window.location.assign(url);
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not start checkout')),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success('Subscription cancellation requested');
      qc.invalidateQueries({ queryKey: keys.subscription });
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not cancel subscription')),
  });
}
