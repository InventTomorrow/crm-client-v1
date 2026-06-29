'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  useCancelSubscription,
  useCreateCheckout,
  usePlans,
  useSubscription,
} from '../hooks/useBilling';
import type { Plan } from '../types';
import { BillingHistory } from './BillingHistory';
import { CurrentSubscriptionCard } from './CurrentSubscriptionCard';
import { PlanCard } from './PlanCard';

export function BillingView() {
  const params = useSearchParams();
  const returnStatus = params.get('status'); // success | cancelled (Safepay return)

  // Poll the subscription while we wait for the activation webhook.
  const polling = returnStatus === 'success';
  const { data: subscription, isLoading: subLoading } = useSubscription(polling);
  const { data: plans, isLoading: plansLoading } = usePlans();

  const checkout = useCreateCheckout();
  const cancel = useCancelSubscription();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // One-time toast for the redirect outcome.
  useEffect(() => {
    if (returnStatus === 'success') {
      toast.success('Payment received — activating your subscription…');
    } else if (returnStatus === 'cancelled') {
      toast.info('Checkout cancelled');
    }
  }, [returnStatus]);

  const handleSelect = (plan: Plan) => {
    setPendingPlanId(plan.id);
    checkout.mutate(plan.id);
  };

  const activePlanId =
    subscription && subscription.status !== 'CANCELLED' ? subscription.planId : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold">Billing &amp; Subscription</h2>
        <p className="text-[13px] mt-1 text-[var(--ink-soft)]">
          Manage your workspace plan and view payment history.
        </p>
      </div>

      {subLoading ? (
        <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">Loading…</div>
      ) : subscription ? (
        <CurrentSubscriptionCard
          subscription={subscription}
          onCancel={() => setConfirmCancel(true)}
          isCancelling={cancel.isPending}
        />
      ) : (
        <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">
          You don&apos;t have an active subscription. Choose a plan below to get started.
        </div>
      )}

      <div>
        <h3 className="text-[15px] font-semibold mb-3">Plans</h3>
        {plansLoading ? (
          <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">Loading plans…</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(plans ?? []).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === activePlanId}
                isLoading={checkout.isPending && pendingPlanId === plan.id}
                disabled={checkout.isPending}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      <BillingHistory />

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() =>
          cancel.mutate(undefined, { onSettled: () => setConfirmCancel(false) })
        }
        title="Cancel subscription?"
        description="Your plan stays active until the end of the current billing period, after which it will not renew."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep plan"
        loading={cancel.isPending}
      />
    </div>
  );
}
