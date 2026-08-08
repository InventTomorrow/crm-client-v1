'use client';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import type { BusinessVertical } from '@/lib/business-verticals';
import { formatPlanPeriod, formatPlanPrice } from '../utils/planFormat';
import type { Plan } from '../types';
import { PlanLimitsList } from './PlanLimitsList';

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  /** This plan already has a pending approval request — lock its CTA. */
  isRequested: boolean;
  isLoading: boolean;
  disabled: boolean;
  /** Why this plan can't be chosen (e.g. fewer workspaces than the account uses), or null. */
  lockedReason: string | null;
  tenantVertical: BusinessVertical | undefined;
  /**
   * 'manual' — the live path today (SafePay disabled): CTA opens a request
   * dialog with the admin's support contact. 'gateway' — SafePay checkout;
   * only this mode gates the CTA on `providerPlanId` being provisioned.
   */
  checkoutMode: 'manual' | 'gateway';
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, isCurrent, isRequested, isLoading, disabled, lockedReason, tenantVertical, checkoutMode, onSelect }: PlanCardProps) {
  const unavailable = checkoutMode === 'gateway' && !plan.providerPlanId;
  const locked = lockedReason !== null;
  const badges = [
    ...(plan.canResell ? ['Reseller access'] : []),
    ...(plan.canWhitelabel ? ['White-label branding'] : []),
  ];

  return (
    <div
      className={`card p-[22px] flex flex-col ${
        isCurrent ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold">{plan.name}</h3>
        {isCurrent && (
          <span className="badge font-medium text-white bg-[var(--accent)]">Current</span>
        )}
        {isRequested && !isCurrent && (
          <span className="badge font-medium text-info-foreground bg-info-soft">Requested</span>
        )}
        {plan.isTrial && !isCurrent && !isRequested && (
          <span className="badge font-medium text-info-foreground bg-info-soft">Trial</span>
        )}
      </div>

      <div className="mt-3">
        <span className="text-[26px] font-bold">{formatPlanPrice(plan)}</span>
        <span className="text-[13px] text-[var(--ink-soft)]"> {formatPlanPeriod(plan.duration, plan.customDurationDays)}</span>
      </div>

      <div className="mt-4 flex-1">
        <PlanLimitsList plan={plan} tenantVertical={tenantVertical} />
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span key={b} className="badge font-medium text-[var(--accent)] bg-[var(--accent-soft)]">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className={`btn ${isCurrent || locked ? 'btn-outline' : 'btn-grad'} mt-5 w-full justify-center gap-2`}
        disabled={disabled || isCurrent || isRequested || isLoading || unavailable || locked}
        onClick={() => onSelect(plan)}
      >
        {isLoading ? (
          // Stays visible until the browser navigates to /subscribe/<token>,
          // so the click never looks like it did nothing.
          <>
            <Loader2 size={14} className="animate-spin" />
            Taking you to checkout…
          </>
        ) : isCurrent ? (
          'Current plan'
        ) : isRequested ? (
          'Request pending approval'
        ) : locked ? (
          <>
            <Lock size={14} />
            Too small for your account
          </>
        ) : unavailable ? (
          'Unavailable'
        ) : checkoutMode === 'manual' ? (
          <>
            Continue to checkout
            <ArrowRight size={14} />
          </>
        ) : (
          'Choose plan'
        )}
      </button>
      {locked && (
        <p className="mt-2 text-[11.5px] text-[var(--ink-mute)]">{lockedReason}</p>
      )}
    </div>
  );
}
