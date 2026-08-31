'use client';
import { cn } from '@/lib/utils';
import { COVERAGE_META } from '../types';
import { COVERAGE_DISPLAY_ORDER, COVERAGE_DOT_TONE } from '../utils/coverageTone';

/**
 * What each cell value means. Vertical rather than a wrapped inline row: the
 * descriptions are the point, and side by side they truncate into noise.
 */
export function CoverageLegend({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <p className="text-xs font-medium">What each status tells the assistant</p>
      <ul className="mt-3 space-y-2.5">
        {COVERAGE_DISPLAY_ORDER.map((level) => (
          <li key={level} className="flex items-start gap-2.5 text-xs leading-relaxed">
            <span
              aria-hidden
              className={cn(
                'mt-1.5 size-2 shrink-0 rounded-full',
                COVERAGE_DOT_TONE[level],
              )}
            />
            <span>
              <span className="font-medium">{COVERAGE_META[level].label}</span>
              <span className="text-muted-foreground">
                {' '}
                — {COVERAGE_META[level].description}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
