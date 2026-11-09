'use client';
import { useFollowUpReplyRates } from '../hooks/useFollowUpReplyRates';
import type { FollowUpAnalyticsRange, ReplyRate } from '../types';

const toPercent = (replyRate: number) => `${Math.round(replyRate * 100)}%`;

function ReplyRateRow({ label, rate }: { label: string; rate: ReplyRate }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[90px] text-[12px] font-medium text-[var(--ink-soft)]">{label}</div>
      <div className="relative h-[22px] flex-1 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)]">
        <div className="h-full bg-[var(--accent)] transition-all" style={{ width: toPercent(rate.replyRate) }} />
      </div>
      <div className="w-[110px] text-right text-[11px] text-[var(--ink-mute)]">
        {rate.replied} of {rate.sent} · {toPercent(rate.replyRate)}
      </div>
    </div>
  );
}

export function FollowUpReplyRatesCard({ range }: { range: FollowUpAnalyticsRange }) {
  const { data: analytics } = useFollowUpReplyRates(range);
  if (!analytics?.isAvailable) return null;

  return (
    <div className="card p-[18px]">
      <div className="mb-3.5">
        <h3 className="text-[14px] font-semibold">Follow-up replies</h3>
        <div className="text-[12px] text-[var(--ink-mute)]">
          Customers who wrote back within {analytics.replyWindowHours} hours of a follow-up
        </div>
      </div>
      {analytics.totals.sent === 0 ? (
        <p className="text-[12px] text-[var(--ink-mute)]">No follow-ups were sent in this period.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {analytics.attempts.map((attemptRate) => (
            <ReplyRateRow
              key={attemptRate.attempt}
              label={`Follow-up ${attemptRate.attempt}`}
              rate={attemptRate}
            />
          ))}
          <div className="mt-1 border-t border-[var(--line)] pt-2">
            <ReplyRateRow label="All" rate={analytics.totals} />
          </div>
        </div>
      )}
    </div>
  );
}
