'use client';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useLeadVocabulary } from '@/features/leads/utils/leadVocabulary';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import type { FollowUpLeadStatus } from '../types';
import { moveStatusInPriority, toggleStatusInPriority } from '../utils/priorityOrder';

interface FollowUpPriorityEditorProps {
  priority: FollowUpLeadStatus[];
  eligibleStatuses: FollowUpLeadStatus[];
  onChange: (priority: FollowUpLeadStatus[]) => void;
}

export function FollowUpPriorityEditor({
  priority,
  eligibleStatuses,
  onChange,
}: FollowUpPriorityEditorProps) {
  const vocabulary = useLeadVocabulary();
  const excludedStatuses = eligibleStatuses.filter((status) => !priority.includes(status));
  const statusLabel = (status: FollowUpLeadStatus) =>
    vocabulary.statusMeta[status.toLowerCase()]?.label ?? status;

  return (
    <ol className="flex flex-col gap-1.5">
      {priority.map((status, rank) => (
        <li
          key={status}
          className="flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
        >
          <Checkbox
            checked
            onCheckedChange={() => onChange(toggleStatusInPriority(priority, status))}
            aria-label={`Stop following up ${statusLabel(status)}`}
          />
          <span className="w-5 text-[11px] font-semibold text-[var(--ink-mute)]">{rank + 1}.</span>
          <span className="flex-1 text-[12.5px] font-medium text-[var(--ink)]">{statusLabel(status)}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={rank === 0}
            onClick={() => onChange(moveStatusInPriority(priority, status, -1))}
            aria-label={`Move ${statusLabel(status)} up`}
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={rank === priority.length - 1}
            onClick={() => onChange(moveStatusInPriority(priority, status, 1))}
            aria-label={`Move ${statusLabel(status)} down`}
          >
            <ArrowDown size={14} />
          </Button>
        </li>
      ))}
      {excludedStatuses.map((status) => (
        <li
          key={status}
          className="flex items-center gap-2.5 rounded-xl border border-dashed border-[var(--line)] px-3 py-2"
        >
          <Checkbox
            checked={false}
            onCheckedChange={() => onChange(toggleStatusInPriority(priority, status))}
            aria-label={`Follow up ${statusLabel(status)}`}
          />
          <span className="flex-1 text-[12.5px] text-[var(--ink-mute)]">
            {statusLabel(status)}. Not followed up
          </span>
        </li>
      ))}
    </ol>
  );
}
