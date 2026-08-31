'use client';
import { cn } from '@/lib/utils';
import { Loader2, Pencil } from 'lucide-react';
import {
  COVERAGE_META,
  type CoverageCellStatus,
  type ResolvedCoverageLevel,
} from '../types';
import { COVERAGE_CHIP_TONE, COVERAGE_DOT_TONE } from '../utils/coverageTone';

/** The status as a read-only pill — the same shape wherever coverage is shown. */
export function CoverageStatusChip({
  level,
  className,
}: Readonly<{ level: ResolvedCoverageLevel; className?: string }>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        COVERAGE_CHIP_TONE[level],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 shrink-0 rounded-full', COVERAGE_DOT_TONE[level])}
      />
      {COVERAGE_META[level].label}
    </span>
  );
}

interface CoverageStatusControlProps {
  level: ResolvedCoverageLevel;
  /** What is being changed, for the screen-reader label — "Physio in F-10, Islamabad". */
  label: string;
  status?: CoverageCellStatus;
  onEdit: () => void;
  className?: string;
}

/**
 * The status, plus the pencil that opens the editor.
 *
 * Reading the grid is the common case and editing the rare one, so the cell
 * shows what it is rather than a select that looks half-filled in every row.
 */
export function CoverageStatusControl({
  level,
  label,
  status,
  onEdit,
  className,
}: Readonly<CoverageStatusControlProps>) {
  const isSaving = status === 'saving';

  return (
    <button
      type="button"
      onClick={onEdit}
      // Only this cell locks, and only while its own save is in flight.
      disabled={isSaving}
      aria-busy={isSaving}
      aria-label={`Change coverage for ${label} — currently ${COVERAGE_META[level].label}`}
      className={cn(
        'group/status flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1 text-left transition-colors',
        'hover:bg-foreground/5 focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-progress disabled:opacity-70',
        status === 'error' && 'ring-destructive bg-destructive/5 ring-1',
        className,
      )}
    >
      <CoverageStatusChip level={level} />
      {isSaving ? (
        <Loader2 className="text-muted-foreground size-3.5 shrink-0 animate-spin" />
      ) : (
        <Pencil className="text-muted-foreground size-3.5 shrink-0 opacity-45 transition-opacity group-hover/status:opacity-100" />
      )}
    </button>
  );
}
