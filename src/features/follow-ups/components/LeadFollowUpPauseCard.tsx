'use client';
import { MessageCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { CRMSwitch } from '@/shared/ui/CRMSwitch';
import { PermissionGuard } from '@/shared/ui/PermissionGuard';
import { useLeadFollowUpPauseToggle } from '../hooks/useLeadFollowUpPause';

export function LeadFollowUpPauseCard({ leadId }: { leadId: string }) {
  const {
    isVisible,
    isPaused,
    isPausedByCustomer,
    pausedAt,
    isPending,
    isResumeConfirmOpen,
    toggleFollowUps,
    confirmResume,
    cancelResume,
  } = useLeadFollowUpPauseToggle(leadId);

  if (!isVisible) return null;

  const statusText = !isPaused
    ? 'On — a follow-up goes out if they go quiet after your reply.'
    : isPausedByCustomer
      ? `Paused — they asked to stop on ${formatDateTime(pausedAt)}.`
      : `Paused by your team on ${formatDateTime(pausedAt)}.`;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
        Follow-ups
      </p>
      <div className="card p-3 bg-[var(--surface-2)] flex items-center gap-3">
        <MessageCircle size={14} className="text-[var(--ink-mute)] flex-shrink-0" />
        <p className="flex-1 text-[12px] text-[var(--ink)]">{statusText}</p>
        <PermissionGuard permission="leads:edit">
          <CRMSwitch on={!isPaused} onChange={(isOn) => !isPending && toggleFollowUps(isOn)} />
        </PermissionGuard>
      </div>

      <ConfirmDialog
        open={isResumeConfirmOpen}
        onClose={cancelResume}
        onConfirm={confirmResume}
        loading={isPending}
        title="Turn follow-ups back on?"
        description="This person asked not to be messaged. Only turn follow-ups back on if they have since agreed to hear from you."
        confirmLabel="Turn back on"
      />
    </div>
  );
}
