"use client";
import { Progress } from "@/shared/ui/Progress";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUsage } from "../hooks/useBilling";

/** Anything at or above this share of the allowance is worth flagging. */
const WARN_AT = 0.8;

function pct(used: number, limit: number): number {
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function fmtResetDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Compact plan-usage overview for the dashboard. Hides itself for members
 * whose role can't read usage (403) and for accounts with no active plan —
 * the full breakdown lives at Settings → Usage.
 */
export function UsageSummaryCard() {
  const { data: usage, isLoading, isError } = useUsage();

  if (isLoading) {
    return (
      <div className="card p-[18px]">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded-md bg-[var(--line)] dark:bg-white/10" />
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-md bg-[var(--line)] dark:bg-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !usage) return null;

  const resetDate = fmtResetDate(usage.periodEnd);
  const nearingLimit = usage.metrics.some(
    (m) => m.limit > 0 && m.used / m.limit >= WARN_AT,
  );

  return (
    <div className="card p-[18px] max-w-[500px]">
      <div className="mb-3.5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[14px] font-semibold">Plan usage</h3>
          <div className="text-[12px] text-[var(--ink-mute)]">
            {usage.plan.name}
            {resetDate ? ` · resets ${resetDate}` : ""}
          </div>
        </div>
        <Link
          href={nearingLimit ? "/settings/billing" : "/settings/usage"}
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--accent)] no-underline hover:underline"
        >
          {nearingLimit ? "Upgrade" : "View details"} <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-2">
        {usage.metrics.map((metric) => {
          const exhausted = metric.limit > 0 && metric.used >= metric.limit;
          const warning =
            !exhausted &&
            metric.limit > 0 &&
            metric.used / metric.limit >= WARN_AT;
          return (
            <div key={metric.key}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] text-[var(--ink-soft)]">
                  {metric.label}
                </span>
                <span
                  className={`text-[12px] font-medium tabular-nums ${
                    exhausted
                      ? "text-destructive-foreground"
                      : warning
                        ? "text-warning-foreground"
                        : "text-[var(--ink)]"
                  }`}
                >
                  {metric.used.toLocaleString("en-PK")} /{" "}
                  {metric.limit.toLocaleString("en-PK")}
                </span>
              </div>
              <Progress
                value={pct(metric.used, metric.limit)}
                aria-label={`${metric.label}: ${metric.used} of ${metric.limit} used`}
                className={`mt-1 h-1 ${
                  exhausted
                    ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                    : warning
                      ? "[&_[data-slot=progress-indicator]]:bg-warning"
                      : ""
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
