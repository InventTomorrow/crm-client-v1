'use client';
import { formatDateTime } from '@/lib/date';
import { useUpcomingFollowUps } from '../hooks/useUpcomingFollowUps';
import type { ScheduledFollowUp } from '../types';

const getLeadLabel = ({ leadName, leadPhone }: ScheduledFollowUp) =>
  leadName ?? leadPhone ?? 'Unnamed lead';

function UpcomingFollowUpRow({ followUp }: { followUp: ScheduledFollowUp }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <div className="min-w-0 flex-1 truncate font-medium text-[var(--ink-soft)]">
        {getLeadLabel(followUp)}
      </div>
      <div className="shrink-0 text-[11px] text-[var(--ink-mute)]">
        Follow-up {followUp.nextAttempt} · {formatDateTime(followUp.dueAt)}
      </div>
    </div>
  );
}

export function UpcomingFollowUpsCard() {
  const { data: upcoming } = useUpcomingFollowUps();
  if (!upcoming?.isAvailable) return null;

  return (
    <div className="card p-[18px]">
      <div className="mb-3.5">
        <h3 className="text-[14px] font-semibold">Upcoming follow-ups</h3>
        <div className="text-[12px] text-[var(--ink-mute)]">
          Leads who get a follow-up next if they stay quiet
        </div>
      </div>
      {upcoming.followUps.length === 0 ? (
        <p className="text-[12px] text-[var(--ink-mute)]">No follow-ups are scheduled.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {upcoming.followUps.map((followUp) => (
            <UpcomingFollowUpRow key={followUp.leadId} followUp={followUp} />
          ))}
        </div>
      )}
    </div>
  );
}
