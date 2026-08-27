'use client';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';
import { HelpCircle } from 'lucide-react';

interface FieldHintProps {
  /** Named for screen readers, since the icon carries no text of its own. */
  label: string;
  children: React.ReactNode;
}

/**
 * Explanation for one field, folded behind an icon beside its label.
 *
 * A popover rather than a tooltip: help text runs to a sentence or two, and a
 * hover-only tooltip is unreachable on a touch device — an admin filling this
 * form on a phone is exactly who needs the explanation.
 */
export function FieldHint({ label, children }: FieldHintProps) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label={`What is ${label}?`}
        className="text-[var(--ink-mute)] hover:text-[var(--ink)] focus-visible:ring-ring/50 inline-flex shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-2"
      >
        <HelpCircle size={13} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 text-[12px] leading-relaxed text-[var(--ink-mute)]"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
