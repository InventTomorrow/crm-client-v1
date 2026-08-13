'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  cancelSubscription,
  changePlan,
  createCheckout,
  createSelfServeCheckoutLink,
  getEntitlementStatus,
  getMessageAllowance,
  getPayments,
  getMyPlanRequest,
  getPlans,
  getSubscription,
  getUsage,
  getSupportContact,
  getWorkspaceAllowance,
  reactivateSubscription,
} from '../services/billingService';
import type { Subscription } from '../types';

const keys = {
  all: ['billing'] as const,
  plans: ['billing', 'plans'] as const,
  supportContact: ['billing', 'support-contact'] as const,
  subscription: ['billing', 'subscription'] as const,
  planRequest: ['billing', 'plan-request'] as const,
  payments: ['billing', 'payments'] as const,
  usage: ['billing', 'usage'] as const,
  workspaceAllowance: ['billing', 'workspace-allowance'] as const,
  messageAllowance: ['billing', 'message-allowance'] as const,
  entitlement: ['billing', 'entitlement'] as const,
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
/** Maximum time to poll for subscription activation after checkout (ms). */
const POLL_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export function useSubscription(pollUntilActive = false) {
  return useQuery({
    queryKey: keys.subscription,
    queryFn: getSubscription,
    refetchInterval: pollUntilActive
      ? (query) => {
          const data = query.state.data as Subscription | null | undefined;
          if (data?.status === 'ACTIVE') return false;
          // Stop polling if the query has been running longer than the timeout.
          const elapsed = Date.now() - (query.state.dataUpdatedAt ?? 0);
          if (query.state.dataUpdatedAt && elapsed > POLL_TIMEOUT_MS) return false;
          return 4000;
        }
      : false,
  });
}

/** Latest manual plan request — powers the "Requested" state on the plan grid. */
export function usePlanRequest() {
  return useQuery({ queryKey: keys.planRequest, queryFn: getMyPlanRequest });
}

/** Consumption vs plan limits for the current period. */
export function useUsage() {
  return useQuery({ queryKey: keys.usage, queryFn: getUsage, staleTime: 60 * 1000 });
}

/** Send quotas (messages + image/voice sublimits) for the inbox composer. */
export function useMessageAllowance() {
  return useQuery({
    queryKey: keys.messageAllowance,
    queryFn: getMessageAllowance,
    staleTime: 60 * 1000,
  });
}

export function useWorkspaceAllowance() {
  return useQuery({
    queryKey: keys.workspaceAllowance,
    queryFn: getWorkspaceAllowance,
    staleTime: 60 * 1000,
  });
}

/** Whether the workspace is usable at all — powers the expiry lock screen. */
export function useEntitlementStatus() {
  return useQuery({
    queryKey: keys.entitlement,
    queryFn: getEntitlementStatus,
    staleTime: 60 * 1000,
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

/**
 * Upgrade or downgrade. Upgrades hand off to checkout because they must be paid
 * for before anything switches; downgrades just book the change for period end.
 */
export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => changePlan(planId),
    onSuccess: (result) => {
      if (result.type === 'redirect') {
        window.location.assign(result.url);
        return;
      }
      toast.success('Plan change scheduled for the end of your billing period');
      qc.invalidateQueries({ queryKey: keys.subscription });
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not change your plan')),
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

export function useReactivateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reactivateSubscription,
    onSuccess: () => {
      toast.success('Scheduled change cancelled — your plan continues as before');
      qc.invalidateQueries({ queryKey: keys.subscription });
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not undo the scheduled change')),
  });
}
