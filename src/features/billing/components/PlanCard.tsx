'use client';
import { Loader2 } from 'lucide-react';
import type { BusinessVertical } from '@/lib/business-verticals';
import { formatPlanPeriod, formatPlanPrice } from '../utils/planFormat';
import type { Plan } from '../types';
import { PlanLimitsList } from './PlanLimitsList';

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isLoading: boolean;
  disabled: boolean;
  tenantVertical: BusinessVertical | undefined;
  /**
   * 'manual' — the live path today (SafePay disabled): CTA opens a request
   * dialog with the admin's support contact. 'gateway' — SafePay checkout;
   * only this mode gates the CTA on `providerPlanId` being provisioned.
   */
  checkoutMode: 'manual' | 'gateway';
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, isCurrent, isLoading, disabled, tenantVertical, checkoutMode, onSelect }: PlanCardProps) {
  const unavailable = checkoutMode === 'gateway' && !plan.providerPlanId;
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
        {plan.isTrial && !isCurrent && (
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
        className={`btn ${isCurrent ? 'btn-outline' : 'btn-grad'} mt-5 w-full justify-center`}
        disabled={disabled || isCurrent || isLoading || unavailable}
        onClick={() => onSelect(plan)}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isCurrent ? (
          'Current plan'
        ) : unavailable ? (
          'Unavailable'
        ) : checkoutMode === 'manual' ? (
          'Request this plan'
        ) : (
          'Choose plan'
        )}
      </button>
    </div>
  );
}
