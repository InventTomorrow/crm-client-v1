'use client';
import { useMemo, useState } from 'react';
import type { BusinessVertical } from '@/lib/business-verticals';
import { formatDurationLabel } from '../utils/planFormat';
import type { Plan, PlanDuration } from '../types';
import { PlanCard } from './PlanCard';

interface PlanGridProps {
  plans: Plan[];
  activePlanId: string | null;
  /** Plan with a pending approval request — its card shows "Requested". */
  requestedPlanId: string | null;
  pendingPlanId: string | null;
  isMutating: boolean;
  /** Workspaces the account already runs — plans whose cap is below this are locked. */
  workspacesInUse: number;
  tenantVertical: BusinessVertical | undefined;
  checkoutMode: 'manual' | 'gateway';
  onSelect: (plan: Plan) => void;
}

const TRIALS_TAB = 'TRIALS' as const;
type Tab = PlanDuration | typeof TRIALS_TAB;

/** Duration toggle (Monthly / Quarterly / Annual / Trials, data-driven from what's actually offered) + the plan cards for the selected tab. */
export function PlanGrid({ plans, activePlanId, requestedPlanId, pendingPlanId, isMutating, workspacesInUse, tenantVertical, checkoutMode, onSelect }: PlanGridProps) {
  const { tabs, plansByTab } = useMemo(() => {
    const byTab = new Map<Tab, Plan[]>();
    for (const plan of plans) {
      const tab: Tab = plan.isTrial ? TRIALS_TAB : plan.duration;
      byTab.set(tab, [...(byTab.get(tab) ?? []), plan]);
    }
    // Stable, human-relevant order; trials always last.
    const order: Tab[] = ['DAYS_3', 'DAYS_7', 'DAYS_14', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'CUSTOM_DAYS', TRIALS_TAB];
    return { tabs: order.filter((t) => byTab.has(t)), plansByTab: byTab };
  }, [plans]);

  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const selectedTab = activeTab && tabs.includes(activeTab) ? activeTab : (tabs[0] ?? null);
  const visiblePlans = selectedTab ? (plansByTab.get(selectedTab) ?? []) : [];

  if (plans.length === 0) {
    return <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">No plans available yet.</div>;
  }

  return (
    <div className="space-y-4">
      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Filter plans by billing period"
          className="inline-flex flex-wrap gap-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] p-1"
        >
          {tabs.map((tab) => {
            const isSelected = tab === selectedTab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab)}
                className={`rounded-[7px] px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-1)]'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                {tab === TRIALS_TAB ? 'Free trials' : formatDurationLabel(tab)}
                <span className="ml-1.5 text-[11px] text-[var(--ink-mute)]">
                  {plansByTab.get(tab)?.length ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visiblePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === activePlanId}
            isRequested={plan.id === requestedPlanId}
            isLoading={isMutating && pendingPlanId === plan.id}
            disabled={isMutating}
            lockedReason={
              plan.id !== activePlanId && workspacesInUse > plan.maxWorkspaces
                ? `Your account uses ${workspacesInUse} workspaces — this plan allows ${plan.maxWorkspaces}.`
                : null
            }
            tenantVertical={tenantVertical}
            checkoutMode={checkoutMode}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
