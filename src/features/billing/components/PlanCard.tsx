'use client';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { BusinessVertical } from '@/lib/business-verticals';
import { formatPlanPeriod, formatPlanPrice } from '../utils/planFormat';
import type { Plan } from '../types';
import { PlanLimitsList } from './PlanLimitsList';

/** Where this plan sits relative to the one the account is on. */
export type PlanChangeDirection = 'upgrade' | 'downgrade' | 'new';

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  /** This plan already has a pending approval request — lock its CTA. */
  isRequested: boolean;
  /** This plan is already booked to start at the end of the current period. */
  isScheduled: boolean;
  changeDirection: PlanChangeDirection;
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

export function PlanCard({ plan, isCurrent, isRequested, isScheduled, changeDirection, isLoading, disabled, tenantVertical, checkoutMode, onSelect }: PlanCardProps) {
  const unavailable = checkoutMode === 'gateway' && !plan.providerPlanId;
  const comingSoon = plan.isComingSoon;
  const badges = [
    ...(plan.canResell ? ['Reseller access'] : []),
    ...(plan.canWhitelabel ? ['White-label branding'] : []),
  ];
  const defaultCta =
    plan.ctaLabel?.trim() ||
    (checkoutMode === 'manual' ? 'Continue to checkout' : 'Choose plan');
  const ctaText =
    changeDirection === 'upgrade'
      ? 'Upgrade now'
      : changeDirection === 'downgrade'
        ? 'Switch at period end'
        : defaultCta;
  // Nothing here is clickable, so the card shouldn't compete for attention.
  const isInert = unavailable || comingSoon;

  return (
    <div
      className={`card relative flex flex-col p-5 ${
        isCurrent
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : plan.isFeatured && !isInert
            ? 'border-[var(--accent)]'
            : ''
      } ${isInert ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[17px] font-semibold">{plan.name}</h3>
        <div className="flex items-center gap-1.5">
          {plan.isFeatured && !isCurrent && !isInert && (
            <span className="badge font-medium text-white bg-[var(--accent)]">Popular</span>
          )}
          {isCurrent && (
            <span className="badge font-medium text-white bg-[var(--accent)]">Current</span>
          )}
          {isScheduled && !isCurrent && (
            <span className="badge font-medium text-warning-foreground bg-warning-soft">Scheduled</span>
          )}
          {isRequested && !isCurrent && !isScheduled && (
            <span className="badge font-medium text-info-foreground bg-info-soft">Requested</span>
          )}
          {comingSoon && !isCurrent && !isRequested && !isScheduled && (
            <span className="badge font-medium text-warning-foreground bg-warning-soft">Coming soon</span>
          )}
          {unavailable && !isCurrent && !isRequested && !isScheduled && !comingSoon && (
            <span className="badge font-medium text-[var(--ink-soft)] bg-[var(--surface-2)]">
              Not available yet
            </span>
          )}
          {plan.isTrial && !isCurrent && !isRequested && !isScheduled && !comingSoon && !unavailable && (
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
        className={`btn ${isCurrent || isInert || isScheduled ? 'btn-outline' : 'btn-grad'} mt-5 w-full justify-center gap-2`}
        disabled={disabled || isCurrent || isRequested || isScheduled || isLoading || isInert}
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
        ) : isScheduled ? (
          'Scheduled'
        ) : isRequested ? (
          'Request pending approval'
        ) : comingSoon ? (
          'Coming soon'
        ) : unavailable ? (
          'Not available yet'
        ) : (
          <>
            {ctaText}
            <ArrowRight size={14} />
          </>
        )}
      </button>
      {changeDirection === 'downgrade' && !isInert && !isScheduled && (
        <p className="mt-2 text-[11.5px] text-[var(--ink-mute)]">
          Starts when your current plan ends — no refund for the time remaining.
        </p>
      )}
    </div>
  );
}
