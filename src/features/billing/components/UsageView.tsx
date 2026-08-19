"use client";
import { Progress } from "@/shared/ui/Progress";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUsage } from "../hooks/useBilling";
import { isUnlimitedLimit } from "../utils/planLimits";

/** Anything at or above this share of the allowance is worth flagging. */
const WARN_AT = 0.8;

/** Sublimits of the monthly message allowance — rendered nested under Messages. */
const MESSAGE_SUBLIMIT_KEYS = new Set(["imageMessages", "voiceMessages"]);

function pct(used: number, limit: number): number {
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function fmtDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * What this account has consumed against its plan for the current period.
 * Counts come from the server (derived from the message log), so they reflect
 * every workspace the owner runs — the subscription covers all of them.
 */
export function UsageView() {
  const { data: usage, isLoading } = useUsage();

  if (isLoading) {
    return (
      <>
        <h2 className="text-[20px] font-semibold">Usage</h2>
        <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">
          Loading usage…
        </div>
      </>
    );
  }

  if (!usage) {
    return (
      <>
        <h2 className="text-[20px] font-semibold">Usage</h2>
        <div className="card p-[22px]">
          <p className="text-[13px] text-[var(--ink-soft)]">
            You don&apos;t have an active plan yet, so there&apos;s nothing to
            meter.
          </p>
          <Link
            href="/settings/billing"
            className="btn btn-grad mt-4 inline-flex w-fit justify-center gap-1.5 no-underline"
          >
            Choose a plan <ArrowRight size={14} />
          </Link>
        </div>
      </>
    );
  }

  const periodEnd = fmtDate(usage.periodEnd);
  const nearingLimit = usage.metrics.some(
    (m) => m.limit > 0 && m.used / m.limit >= WARN_AT,
  );

  return (
    <>
      <h2 className="text-[20px] font-semibold">Usage</h2>

      <div className="card p-[22px] max-w-[500px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold">{usage.plan.name}</h3>
            <p className="text-[13px] mt-0.5 text-[var(--ink-soft)]">
              {periodEnd ? `Resets on ${periodEnd}` : "Current period"}
            </p>
          </div>
          {nearingLimit && (
            <Link
              href="/settings/billing"
              className="btn btn-grad inline-flex justify-center gap-1.5 no-underline"
            >
              Upgrade <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-5">
          {usage.metrics.map((metric) => {
            const unlimited = isUnlimitedLimit(metric.limit);
            const percent = unlimited ? 0 : pct(metric.used, metric.limit);
            const exhausted =
              !unlimited && metric.limit > 0 && metric.used >= metric.limit;
            const warning =
              !unlimited &&
              !exhausted &&
              metric.limit > 0 &&
              metric.used / metric.limit >= WARN_AT;

            const isMessageSublimit = MESSAGE_SUBLIMIT_KEYS.has(metric.key);

            return (
              <div
                key={metric.key}
                className={
                  isMessageSublimit
                    ? "ml-1.5 border-l-2 border-[var(--line)] pl-4"
                    : ""
                }
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-[var(--ink-soft)]">
                    {metric.label}
                  </span>
                  <span
                    className={`text-[13px] font-medium tabular-nums ${
                      exhausted
                        ? "text-destructive-foreground"
                        : warning
                          ? "text-warning-foreground"
                          : "text-[var(--ink)]"
                    }`}
                  >
                    {(metric.used ?? 0).toLocaleString("en-PK")} /{" "}
                    {unlimited
                      ? "Unlimited"
                      : metric.limit != null
                        ? metric.limit.toLocaleString("en-PK")
                        : "—"}
                  </span>
                </div>
                <Progress
                  value={percent}
                  aria-label={
                    unlimited
                      ? `${metric.label}: ${metric.used} used of unlimited`
                      : `${metric.label}: ${metric.used} of ${metric.limit} used`
                  }
                  className={`mt-1.5 h-1.5 ${
                    exhausted
                      ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                      : warning
                        ? "[&_[data-slot=progress-indicator]]:bg-warning"
                        : ""
                  }`}
                />
                {exhausted && (
                  <p className="mt-1 text-[11.5px] text-destructive-foreground">
                    Limit reached — upgrade to keep going.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[12px] text-[var(--ink-mute)]">
        Counts cover every workspace on this account for the current billing
        period.
      </p>
    </>
  );
}
