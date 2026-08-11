'use client';
import { ArrowRight, Loader2, TriangleAlert } from 'lucide-react';
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
  /** Heads-up when the plan covers fewer workspaces than the account uses — informative, never blocking. */
  workspaceNotice: string | null;
  tenantVertical: BusinessVertical | undefined;
  /**
   * 'manual' — the live path today (SafePay disabled): CTA opens a request
   * dialog with the admin's support contact. 'gateway' — SafePay checkout;
   * only this mode gates the CTA on `providerPlanId` being provisioned.
   */
  checkoutMode: 'manual' | 'gateway';
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, isCurrent, isRequested, isLoading, disabled, workspaceNotice, tenantVertical, checkoutMode, onSelect }: PlanCardProps) {
  const unavailable = checkoutMode === 'gateway' && !plan.providerPlanId;
  const comingSoon = plan.isComingSoon;
  const badges = [
    ...(plan.canResell ? ['Reseller access'] : []),
    ...(plan.canWhitelabel ? ['White-label branding'] : []),
  ];
  const ctaText =
    plan.ctaLabel?.trim() ||
    (checkoutMode === 'manual' ? 'Continue to checkout' : 'Choose plan');

  return (
    <div
      className={`card relative flex flex-col p-5 ${
        isCurrent
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : plan.isFeatured
            ? 'border-[var(--accent)]'
            : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[17px] font-semibold">{plan.name}</h3>
        <div className="flex items-center gap-1.5">
          {plan.isFeatured && !isCurrent && (
            <span className="badge font-medium text-white bg-[var(--accent)]">Popular</span>
          )}
          {isCurrent && (
            <span className="badge font-medium text-white bg-[var(--accent)]">Current</span>
          )}
          {isRequested && !isCurrent && (
            <span className="badge font-medium text-info-foreground bg-info-soft">Requested</span>
          )}
          {comingSoon && !isCurrent && !isRequested && (
            <span className="badge font-medium text-warning-foreground bg-warning-soft">Coming soon</span>
          )}
          {plan.isTrial && !isCurrent && !isRequested && !comingSoon && (
            <span className="badge font-medium text-info-foreground bg-info-soft">Trial</span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[26px] font-bold">{formatPlanPrice(plan)}</span>
        <span className="text-[13px] text-[var(--ink-soft)]"> {formatPlanPeriod(plan.duration, plan.customDurationDays)}</span>
      </div>

      <div className="mt-4 flex-1">
        {plan.features.length > 0 ? (
          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-[13px] text-[var(--ink-soft)]">
                <span className="mt-0.5">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        ) : (
          <PlanLimitsList plan={plan} tenantVertical={tenantVertical} />
        )}
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
        className={`btn ${isCurrent ? 'btn-outline' : 'btn-grad'} mt-5 w-full justify-center gap-2`}
        disabled={disabled || isCurrent || isRequested || isLoading || unavailable || comingSoon}
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
        ) : comingSoon ? (
          'Coming soon'
        ) : unavailable ? (
          'Unavailable'
        ) : (
          <>
            {ctaText}
            <ArrowRight size={14} />
          </>
        )}
      </button>
      {workspaceNotice && (
        <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-warning-foreground">
          <TriangleAlert size={13} className="mt-px shrink-0" />
          {workspaceNotice}
        </p>
      )}
    </div>
  );
}
