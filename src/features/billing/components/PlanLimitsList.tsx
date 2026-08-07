'use client';
import { resolveCatalogLimit } from '../utils/planLimits';
import type { Plan } from '../types';
import type { BusinessVertical } from '@/lib/business-verticals';

interface PlanLimitsListProps {
  plan: Plan;
  tenantVertical: BusinessVertical | undefined;
}

/**
 * Full limit breakdown for a plan: workspaces, team members, channels, the
 * one catalogue count that applies to the tenant's own vertical, and the
 * message allowance with image-vision and voice-message sublimits nested
 * under the total.
 */
export function PlanLimitsList({ plan, tenantVertical }: PlanLimitsListProps) {
  const catalog = tenantVertical ? resolveCatalogLimit(plan, tenantVertical) : null;

  return (
    <dl className="space-y-2.5 text-[13px]">
      <Row label="Workspaces" value={plan.maxWorkspaces.toLocaleString('en-PK')} />
      <Row label="Team members / workspace" value={plan.maxMembersPerWorkspace.toLocaleString('en-PK')} />
      <Row label="Connected channels" value={plan.maxChannels.toLocaleString('en-PK')} />
      {catalog && catalog.value !== null && (
        <Row label={`Max ${catalog.label}`} value={catalog.value.toLocaleString('en-PK')} />
      )}

      <div className="pt-1">
        <Row label="Messages / month" value={plan.maxMonthlyMessages.toLocaleString('en-PK')} strong />
        <div className="ml-3 mt-1.5 space-y-1.5 border-l border-[var(--line)] pl-3">
          <Row label="Image vision" value={plan.maxImageMessages.toLocaleString('en-PK')} muted />
          <Row label="Voice messages" value={plan.maxVoiceMessages.toLocaleString('en-PK')} muted />
        </div>
      </div>
    </dl>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? 'text-[12px] text-[var(--ink-mute)]' : 'text-[var(--ink-soft)]'}>{label}</dt>
      <dd className={strong ? 'font-semibold' : muted ? 'text-[12px] font-medium' : 'font-medium'}>{value}</dd>
    </div>
  );
}
