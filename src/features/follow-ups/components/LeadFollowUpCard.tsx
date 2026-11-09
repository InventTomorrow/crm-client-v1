'use client';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { CRMSwitch } from '@/shared/ui/CRMSwitch';
import { PermissionGuard } from '@/shared/ui/PermissionGuard';
import { useLeadFollowUpPauseToggle } from '../hooks/useLeadFollowUpPause';
import type { LeadFollowUpStatus, ManualFollowUpResult } from '../types';

type StatusTone = 'active' | 'warning' | 'muted';

interface StatusSummary {
  label: string;
  tone: StatusTone;
  description: string;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  active: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning-foreground)]',
  muted: 'bg-[var(--surface)] text-[var(--ink-mute)] border border-[var(--line)]',
};

function summarize(status: LeadFollowUpStatus): StatusSummary {
  if (status.manualFollowUp?.state === 'QUEUED') {
    return {
      label: 'Queued',
      tone: 'active',
      description: 'A follow-up is queued. It is written and sent as soon as it reaches the front.',
    };
  }
  if (status.followUpsPausedAt) {
    const pausedOn = formatDateTime(status.followUpsPausedAt);
    return {
      label: 'Paused',
      tone: 'muted',
      description:
        status.followUpsPausedBy === 'CUSTOMER'
          ? `They asked to stop on ${pausedOn}. No follow-ups are sent.`
          : `Paused by your team on ${pausedOn}. No automatic follow-ups are sent.`,
    };
  }
  if (status.state === 'BLOCKED') {
    return {
      label: 'On hold',
      tone: 'warning',
      description: 'A follow-up is on hold because your WhatsApp number was disconnected.',
    };
  }
  if (status.state === 'SCHEDULED' && status.nextFollowUpAt) {
    return {
      label: 'Scheduled',
      tone: 'active',
      description: `The next follow-up goes out around ${formatDateTime(status.nextFollowUpAt)} if they stay quiet.`,
    };
  }
  return {
    label: 'Nothing scheduled',
    tone: 'muted',
    description: 'A follow-up is scheduled after your next reply, if they go quiet.',
  };
}

function ManualOutcome({ result }: { result: ManualFollowUpResult | null }) {
  if (!result || result.state === 'QUEUED') return null;
  if (result.state === 'FAILED') {
    return (
      <p className="rounded-lg bg-[var(--warning-soft)] px-2.5 py-2 text-[11.5px] text-[var(--warning-foreground)]">
        {result.message}
      </p>
    );
  }
  return (
    <p className="rounded-lg bg-[var(--accent-soft)] px-2.5 py-2 text-[11.5px] text-[var(--ink)]">
      <span className="font-medium text-[var(--accent)]">Sent just now:</span> &ldquo;{result.text}&rdquo;
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">{label}</div>
      <div className="mt-0.5 text-[12.5px] font-semibold text-[var(--ink)]">{value}</div>
    </div>
  );
}

export function LeadFollowUpCard({ leadId }: { leadId: string }) {
  const {
    status,
    isVisible,
    isPaused,
    isPausedByCustomer,
    isPending,
    isResumeConfirmOpen,
    toggleFollowUps,
    confirmResume,
    cancelResume,
    manualFollowUp,
    isQueuing,
    followUpNow,
  } = useLeadFollowUpPauseToggle(leadId);

  if (!isVisible || !status) return null;
  const summary = summarize(status);
  const isQueued = manualFollowUp?.state === 'QUEUED';
  const nextFollowUp =
    !isPaused && status.state === 'SCHEDULED' && status.nextFollowUpAt
      ? formatDateTime(status.nextFollowUpAt)
      : 'N/A';

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">Follow-ups</p>

      <div className="card flex flex-col gap-3 bg-[var(--surface-2)] p-3.5">
        <div className="flex items-start gap-3">
          <MessageCircle size={15} className="mt-0.5 shrink-0 text-[var(--ink-mute)]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] font-semibold text-[var(--ink)]">Automatic follow-ups</span>
              <span className={cn('rounded-full px-2 py-px text-[10.5px] font-medium', TONE_CLASSES[summary.tone])}>
                {summary.label}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] leading-snug text-[var(--ink-mute)]">{summary.description}</p>
          </div>
          <PermissionGuard permission="leads:edit">
            <CRMSwitch on={!isPaused} onChange={(isOn) => !isPending && toggleFollowUps(isOn)} />
          </PermissionGuard>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Sent" value={`${status.attemptsSent} of ${status.maxAttempts}`} />
          <Stat label="Next" value={nextFollowUp} />
        </div>

        <PermissionGuard permission="leads:edit">
          <div className="flex flex-col gap-1.5 border-t border-[var(--line)] pt-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={isQueuing || isQueued || isPausedByCustomer}
              onClick={followUpNow}
            >
              {isQueuing ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Queuing…
                </>
              ) : isQueued ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Queued, sending shortly
                </>
              ) : (
                <>
                  <Send size={13} /> Follow up now
                </>
              )}
            </Button>
            <ManualOutcome result={manualFollowUp} />
            <p className="text-[11px] text-[var(--ink-mute)]">
              {isPausedByCustomer
                ? 'They asked not to be messaged, so this is turned off.'
                : 'Jumps the queue: the assistant writes a personal message from this chat and sends it on WhatsApp.'}
            </p>
          </div>
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
