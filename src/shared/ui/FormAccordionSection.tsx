'use client';
import { cn } from '@/lib/utils';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/Accordion';
import type { LucideIcon } from 'lucide-react';

interface FormAccordionSectionProps {
  value: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  /** One-line recap of what this section holds, shown open or closed. */
  summary: string;
  /** Renders the summary as a muted placeholder rather than a filled value. */
  isEmpty?: boolean;
  /** Marks a section that failed validation, so a collapsed one still reads as wrong. */
  hasError?: boolean;
  children: React.ReactNode;
}

/**
 * One collapsible section of a long form.
 *
 * The summary stays visible whether the section is open or closed: it keeps the
 * trigger height stable while sections expand, and someone re-reading a filled
 * section wants the recap as much as someone scanning a collapsed form.
 */
export function FormAccordionSection({
  value,
  Icon,
  title,
  description,
  summary,
  isEmpty = false,
  hasError = false,
  children,
}: FormAccordionSectionProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        'card overflow-hidden border transition-colors',
        hasError && 'border-[#DC2626]',
      )}
    >
      <AccordionTrigger className="items-center gap-3 px-5 py-4 hover:no-underline">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--accent)]">
          <Icon size={14} />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13.5px] font-semibold text-[var(--ink)]">
              {title}
            </span>
            <span
              className={cn(
                'truncate text-[12px] font-normal',
                hasError
                  ? 'text-[#DC2626]'
                  : isEmpty
                    ? 'text-[var(--ink-mute)] italic'
                    : 'text-[var(--accent)]',
              )}
            >
              {hasError ? 'Needs attention' : summary}
            </span>
          </span>
          <span className="text-[12px] leading-relaxed font-normal text-[var(--ink-mute)]">
            {description}
          </span>
        </span>
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-5 border-t border-[var(--line)] px-5 pt-5 pb-5">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
