'use client';
import { MessageCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { CRMSwitch } from '@/shared/ui/CRMSwitch';
import { PermissionGuard } from '@/shared/ui/PermissionGuard';
import { useLeadFollowUpPauseToggle } from '../hooks/useLeadFollowUpPause';
import type { LeadFollowUpStatus } from '../types';

function describePause(status: LeadFollowUpStatus): string {
  if (!status.followUpsPausedAt) {
    return 'On — a follow-up goes out if they go quiet after your reply.';
  }
  const pausedOn = formatDateTime(status.followUpsPausedAt);
  return status.followUpsPausedBy === 'CUSTOMER'
    ? `Paused — they asked to stop on ${pausedOn}.`
    : `Paused by your team on ${pausedOn}.`;
}

function describeCycle(status: LeadFollowUpStatus): string | null {
  if (status.followUpsPausedAt) return null;
  if (status.state === 'BLOCKED') {
    return 'A follow-up is waiting — your WhatsApp number is disconnected.';
  }
  if (status.state === 'SCHEDULED' && status.nextFollowUpAt) {
    return `Next follow-up around ${formatDateTime(status.nextFollowUpAt)} (${status.attemptsSent} of ${status.maxAttempts} sent).`;
  }
  return null;
}

export function LeadFollowUpPauseCard({ leadId }: { leadId: string }) {
  const {
    status,
    isVisible,
    isPaused,
    isPending,
    isResumeConfirmOpen,
    toggleFollowUps,
    confirmResume,
    cancelResume,
  } = useLeadFollowUpPauseToggle(leadId);

  if (!isVisible || !status) return null;
  const cycleText = describeCycle(status);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
        Follow-ups
      </p>
      <div className="card p-3 bg-[var(--surface-2)] flex items-center gap-3">
        <MessageCircle size={14} className="text-[var(--ink-mute)] flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-0.5">
          <p className="text-[12px] text-[var(--ink)]">{describePause(status)}</p>
          {cycleText && <p className="text-[11px] text-[var(--ink-mute)]">{cycleText}</p>}
        </div>
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
