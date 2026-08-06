import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Marks the section at a glance so long forms can be scanned instead of read. */
  Icon?: LucideIcon;
  /** Extra content pinned to the label column, under the description. */
  aside?: React.ReactNode;
  className?: string;
  /** Folds the label column into the card header — for stepped forms where a nav rail
   * already carries the section titles. */
  hideLabelColumn?: boolean;
}

/** A titled group of form fields. The label column carries the intent, the fields sit on their
 * own raised panel so each group reads as one block instead of a flat run of inputs. */
export function FormSection({
  title,
  description,
  children,
  Icon,
  aside,
  className,
  hideLabelColumn = false,
}: FormSectionProps) {
  // The label column only indents under the icon from `lg` up, where it sits beside the fields.
  // In the card header it reads as one block, so the indent applies at every width.
  const indentClass = Icon && (hideLabelColumn ? 'pl-[38px]' : 'lg:pl-[38px]');

  const heading = (
    <>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--accent)]">
            <Icon size={14} />
          </span>
        )}
        <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">{title}</h2>
      </div>
      <p
        className={cn(
          'mt-1.5 text-[12px] leading-relaxed text-[var(--ink-mute)]',
          indentClass,
        )}
      >
        {description}
      </p>
      {aside && <div className={cn('mt-3', indentClass)}>{aside}</div>}
    </>
  );

  if (hideLabelColumn) {
    return (
      <section className="card flex flex-col">
        <header className="border-b border-[var(--line)] px-5 py-4">{heading}</header>
        <div className={cn('flex flex-col gap-5 p-5', className)}>{children}</div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-8">
      <div className="lg:sticky lg:top-4 lg:self-start lg:pt-1">{heading}</div>
      <div className={cn('card flex flex-col gap-5 p-5', className)}>{children}</div>
    </section>
  );
}
