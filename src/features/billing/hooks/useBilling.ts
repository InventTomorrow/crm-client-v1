'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  cancelSubscription,
  createCheckout,
  getInvoices,
  getPayments,
  getPlans,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
} from '../services/billingService';
import type { Subscription } from '../types';

const keys = {
  all: ['billing'] as const,
  plans: ['billing', 'plans'] as const,
  subscription: ['billing', 'subscription'] as const,
  invoices: ['billing', 'invoices'] as const,
  payments: ['billing', 'payments'] as const,
};

export function usePlans() {
  return useQuery({ queryKey: keys.plans, queryFn: getPlans, staleTime: 5 * 60 * 1000 });
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

export function useInvoices() {
  return useQuery({ queryKey: keys.invoices, queryFn: getInvoices });
}

export function usePayments() {
  return useQuery({ queryKey: keys.payments, queryFn: getPayments });
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

export function usePauseSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pauseSubscription,
    onSuccess: () => {
      toast.success('Subscription paused');
      qc.invalidateQueries({ queryKey: keys.subscription });
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not pause subscription')),
  });
}

export function useResumeSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resumeSubscription,
    onSuccess: () => {
      toast.success('Subscription resumed');
      qc.invalidateQueries({ queryKey: keys.subscription });
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not resume subscription')),
  });
}
