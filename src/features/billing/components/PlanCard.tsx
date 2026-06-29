'use client';
import { Check, Loader2 } from 'lucide-react';
import { pkr } from '@/lib/utils';
import type { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isLoading: boolean;
  disabled: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, isCurrent, isLoading, disabled, onSelect }: PlanCardProps) {
  const features = [
    `${plan.maxWorkspaces} workspace${plan.maxWorkspaces > 1 ? 's' : ''}`,
    `${plan.maxMembersPerWorkspace} members / workspace`,
    `${plan.maxMonthlyMessages.toLocaleString('en-PK')} messages / month`,
    `${plan.maxChannels} channel${plan.maxChannels > 1 ? 's' : ''}`,
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
      </div>

      <div className="mt-3">
        <span className="text-[26px] font-bold">{pkr(plan.priceMonthly)}</span>
        <span className="text-[13px] text-[var(--ink-soft)]"> / month</span>
      </div>

      <ul className="mt-4 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)]">
            <Check size={14} className="text-[var(--accent)] flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`btn ${isCurrent ? 'btn-outline' : 'btn-grad'} mt-5 w-full justify-center`}
        disabled={disabled || isCurrent || isLoading || !plan.providerPlanId}
        onClick={() => onSelect(plan)}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isCurrent ? (
          'Current plan'
        ) : !plan.providerPlanId ? (
          'Unavailable'
        ) : (
          'Choose plan'
        )}
      </button>
    </div>
  );
}
