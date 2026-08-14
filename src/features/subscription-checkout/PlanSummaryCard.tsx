"use client";
import {
  formatPlanPeriod,
  formatPlanPrice,
} from "@/features/billing/utils/planFormat";
import type { Plan } from "@/features/billing/types";

/** Read-only summary of the plan the admin issued this link for. */
export function PlanSummaryCard({ plan }: { plan: Plan }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[var(--line)] p-4">
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
          Your plan
        </p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-[var(--ink)]">
              {plan.name}
            </div>
            {plan.isTrial && (
              <span className="badge mt-1 font-medium text-info-foreground bg-info-soft">
                Trial
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-[17px] font-semibold text-[var(--ink)]">
              {formatPlanPrice(plan)}
            </div>
            <div className="text-[11.5px] text-[var(--ink-mute)]">
              {formatPlanPeriod(plan.duration, plan.customDurationDays)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-4 text-[13px]">
        <Row label="Workspaces" value={plan.maxWorkspaces.toLocaleString("en-PK")} />
        <Row
          label="Team members / workspace"
          value={plan.maxMembersPerWorkspace.toLocaleString("en-PK")}
        />
        <Row label="Connected channels" value={plan.maxChannels.toLocaleString("en-PK")} />
        <Row
          label="Messages / month"
          value={plan.maxMonthlyMessages.toLocaleString("en-PK")}
        />
        <div className="ml-3 flex flex-col gap-1.5 border-l border-[var(--line)] pl-3">
          <Row
            label="Image vision"
            value={plan.maxImageMessages.toLocaleString("en-PK")}
            muted
          />
          <Row
            label="Voice messages"
            value={plan.maxVoiceMessages.toLocaleString("en-PK")}
            muted
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          muted ? "text-[12px] text-[var(--ink-mute)]" : "text-[var(--ink-mute)]"
        }
      >
        {label}
      </span>
      <span
        className={
          muted
            ? "text-[12px] font-medium text-[var(--ink)]"
            : "font-medium text-[var(--ink)]"
        }
      >
        {value}
      </span>
    </div>
  );
}
