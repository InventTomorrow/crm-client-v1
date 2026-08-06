import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface PreviewPanelProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  Icon?: LucideIcon;
  /** Buttons or badges pinned to the right of the header. */
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/** A titled read-only block — the preview counterpart to `FormSection`, so a saved record reads
 * as the same set of groups the editor writes. */
export function PreviewPanel({
  title,
  children,
  description,
  Icon,
  action,
  className,
  contentClassName,
}: PreviewPanelProps) {
  return (
    <section className={cn('card flex flex-col', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--accent)]">
                <Icon size={14} />
              </span>
            )}
            <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">{title}</h2>
          </div>
          {description && (
            <p
              className={cn(
                'mt-1.5 text-[12px] leading-relaxed text-[var(--ink-mute)]',
                Icon && 'pl-[38px]',
              )}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </header>

      <div className={cn('flex flex-col gap-4 p-5', contentClassName)}>{children}</div>
    </section>
  );
}

/** Placeholder for a field the record never filled in — keeps a panel from collapsing to nothing
 * and says which editor section fills it. */
export function PreviewEmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-3 text-center text-[11.5px] text-[var(--ink-mute)]">
      {children}
    </p>
  );
}

/** One label/value row for the detail panels — value falls back to an em dash when unset. */
export function PreviewDetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="shrink-0 text-[var(--ink-mute)]">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-[var(--ink)]">
        {value ?? '—'}
      </span>
    </div>
  );
}
