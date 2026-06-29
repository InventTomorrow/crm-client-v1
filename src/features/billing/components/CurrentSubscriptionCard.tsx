'use client';
import { Loader2 } from 'lucide-react';
import { pkr } from '@/lib/utils';
import type { Subscription, SubscriptionStatus } from '../types';

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  ACTIVE: 'text-white bg-[var(--accent)]',
  TRIALING: 'text-white bg-[#0EA5E9]',
  PAST_DUE: 'text-white bg-[#DC2626]',
  CANCELLED: 'text-[var(--ink-soft)] bg-[var(--line)]',
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Active',
  TRIALING: 'Processing',
  PAST_DUE: 'Past due',
  CANCELLED: 'Cancelled',
};

function fmtDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface Props {
  subscription: Subscription;
  onCancel: () => void;
  isCancelling: boolean;
}

export function CurrentSubscriptionCard({ subscription, onCancel, isCancelling }: Props) {
  const plan = subscription.plan;
  const canCancel =
    subscription.status !== 'CANCELLED' && !subscription.cancelledAt && Boolean(plan);

  return (
    <div className="card p-[22px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold">{plan?.name ?? 'No plan'}</h3>
            <span className={`badge font-medium ${STATUS_STYLES[subscription.status]}`}>
              {STATUS_LABEL[subscription.status]}
            </span>
          </div>
          {plan && (
            <div className="text-[13px] mt-1 text-[var(--ink-soft)]">
              {pkr(plan.priceMonthly)} / month
            </div>
          )}
        </div>

        {canCancel && (
          <button
            type="button"
            className="btn btn-outline flex-shrink-0"
            onClick={onCancel}
            disabled={isCancelling}
          >
            {isCancelling ? <Loader2 size={14} className="animate-spin" /> : 'Cancel'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5 sm:grid-cols-3">
        <Field label="Renews on" value={fmtDate(subscription.currentPeriodEnd)} />
        <Field label="Started" value={fmtDate(subscription.currentPeriodStart)} />
        {subscription.cancelledAt && (
          <Field label="Cancelled on" value={fmtDate(subscription.cancelledAt)} />
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">{label}</div>
      <div className="text-[14px] font-medium mt-0.5">{value}</div>
    </div>
  );
}
