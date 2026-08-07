'use client';
import { useMemo, useState } from 'react';
import type { BusinessVertical } from '@/lib/business-verticals';
import { formatPlanPeriod } from '../utils/planFormat';
import type { Plan, PlanDuration } from '../types';
import { PlanCard } from './PlanCard';

interface PlanGridProps {
  plans: Plan[];
  activePlanId: string | null;
  pendingPlanId: string | null;
  isMutating: boolean;
  tenantVertical: BusinessVertical | undefined;
  checkoutMode: 'manual' | 'gateway';
  onSelect: (plan: Plan) => void;
}

const TRIALS_TAB = 'TRIALS' as const;
type Tab = PlanDuration | typeof TRIALS_TAB;

/** Duration toggle (Monthly / Quarterly / Annual / Trials, data-driven from what's actually offered) + the plan cards for the selected tab. */
export function PlanGrid({ plans, activePlanId, pendingPlanId, isMutating, tenantVertical, checkoutMode, onSelect }: PlanGridProps) {
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
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`badge font-medium transition-colors ${
                tab === selectedTab
                  ? 'text-white bg-[var(--accent)]'
                  : 'text-[var(--ink-soft)] bg-[var(--line-soft)] hover:bg-[var(--line)]'
              }`}
            >
              {tab === TRIALS_TAB ? 'Trials' : formatPlanPeriod(tab, null).replace('/ ', '')}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visiblePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === activePlanId}
            isLoading={isMutating && pendingPlanId === plan.id}
            disabled={isMutating}
            tenantVertical={tenantVertical}
            checkoutMode={checkoutMode}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
