'use client';
import { formatPlanLimit, resolveCatalogLimit } from '../utils/planLimits';
import type { Plan } from '../types';
import type { BusinessVertical } from '@/lib/business-verticals';

interface PlanLimitsListProps {
  plan: Plan;
  tenantVertical: BusinessVertical | undefined;
  /**
   * 'list' — label/value rows, for narrow columns like a plan card.
   * 'grid' — stat tiles, for full-width panels where rows would stretch a
   * label and its value to opposite edges of the screen.
   */
  variant?: 'list' | 'grid';
}

/**
 * Full limit breakdown for a plan: workspaces, team members, channels, the
 * one catalogue count that applies to the tenant's own vertical, and the
 * message allowance with image-vision and voice-message sublimits nested
 * under the total.
 */
export function PlanLimitsList({ plan, tenantVertical, variant = 'list' }: PlanLimitsListProps) {
  const catalog = tenantVertical ? resolveCatalogLimit(plan, tenantVertical) : null;
  const catalogLimit =
    catalog && catalog.value !== null
      ? { label: `Max ${catalog.label}`, value: formatPlanLimit(catalog.value) }
      : null;

  const messages = formatPlanLimit(plan.maxMonthlyMessages);
  const imageMessages = formatPlanLimit(plan.maxImageMessages);
  const voiceMessages = formatPlanLimit(plan.maxVoiceMessages);

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        <Tile label="Workspaces" value={formatPlanLimit(plan.maxWorkspaces)} />
        <Tile label="Team members / workspace" value={formatPlanLimit(plan.maxMembersPerWorkspace)} />
        <Tile label="Connected channels" value={formatPlanLimit(plan.maxChannels)} />
        {catalogLimit && <Tile label={catalogLimit.label} value={catalogLimit.value} />}
        <Tile label="Messages / month" value={messages}>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-[var(--line)] pt-2 text-[11.5px] text-[var(--ink-mute)]">
            <span>
              Image vision <span className="font-medium text-[var(--ink-soft)]">{imageMessages}</span>
            </span>
            <span>
              Voice <span className="font-medium text-[var(--ink-soft)]">{voiceMessages}</span>
            </span>
          </div>
        </Tile>
      </div>
    );
  }

  return (
    <dl className="space-y-2.5 text-[13px]">
      <Row label="Workspaces" value={formatPlanLimit(plan.maxWorkspaces)} />
      <Row label="Team members / workspace" value={formatPlanLimit(plan.maxMembersPerWorkspace)} />
      <Row label="Connected channels" value={formatPlanLimit(plan.maxChannels)} />
      {catalogLimit && <Row label={catalogLimit.label} value={catalogLimit.value} />}

      <div className="pt-1">
        <Row label="Messages / month" value={messages} strong />
        <div className="ml-3 mt-1.5 space-y-1.5 border-l border-[var(--line)] pl-3">
          <Row label="Image vision" value={imageMessages} muted />
          <Row label="Voice messages" value={voiceMessages} muted />
        </div>
      </div>
    </dl>
  );
}

function Tile({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] p-3">
      <div className="text-[11px] font-medium uppercase leading-tight tracking-wide text-[var(--ink-mute)]">
        {label}
      </div>
      <div className="mt-1.5 text-[18px] font-semibold leading-none">{value}</div>
      {children}
    </div>
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
    <div className="flex items-center justify-between gap-4">
      <dt className={muted ? 'text-[12px] text-[var(--ink-mute)]' : 'text-[var(--ink-soft)]'}>{label}</dt>
      <dd className={strong ? 'font-semibold' : muted ? 'text-[12px] font-medium' : 'font-medium'}>{value}</dd>
    </div>
  );
}
