'use client';
import { Loader2 } from 'lucide-react';
import { formatPlanPeriod, formatPlanPrice } from '../utils/planFormat';
import type { Subscription, SubscriptionStatus } from '../types';

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  ACTIVE: 'text-white bg-[var(--accent)]',
  TRIALING: 'text-info-foreground bg-info-soft',
  PAST_DUE: 'text-destructive-foreground bg-destructive-soft',
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
  // Cancel-at-period-end: status may still read ACTIVE/TRIALING with
  // cancelledAt set, so gate strictly on cancelledAt rather than status alone.
  const canCancel =
    (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING') &&
    !subscription.cancelledAt &&
    Boolean(plan);

  return (
    <div className="card p-5 sm:p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[17px] font-semibold">{plan?.name ?? 'No plan'}</h3>
            <span className={`badge font-medium ${STATUS_STYLES[subscription.status]}`}>
              {/* TRIALING on an actual trial plan is the trial itself, not a checkout in flight. */}
              {subscription.status === 'TRIALING' && plan?.isTrial
                ? 'Trial'
                : STATUS_LABEL[subscription.status]}
            </span>
          </div>
          {plan && (
            <div className="text-[13px] mt-1 text-[var(--ink-soft)]">
              {formatPlanPrice(plan)} {formatPlanPeriod(plan.duration, plan.customDurationDays)}
            </div>
          )}
        </div>

        {/* Dates sit beside the plan on wide screens so the label and its value
            never end up at opposite edges of the viewport. */}
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4 sm:gap-x-10">
          <Field label="Renews on" value={fmtDate(subscription.currentPeriodEnd)} />
          <Field label="Started" value={fmtDate(subscription.currentPeriodStart)} />
          {subscription.cancelledAt && (
            <Field label="Cancelled on" value={fmtDate(subscription.cancelledAt)} />
          )}

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
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">{label}</div>
      <div className="text-[14px] font-medium mt-1 whitespace-nowrap">{value}</div>
    </div>
  );
}
