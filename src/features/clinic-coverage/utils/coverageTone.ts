import type { ResolvedCoverageLevel } from '../types';

/** The order statuses are read in — best case first, "no row at all" last. */
export const COVERAGE_DISPLAY_ORDER: ResolvedCoverageLevel[] = [
  'AVAILABLE',
  'LIMITED',
  'UNAVAILABLE',
  'UNKNOWN',
];

/** Status pill fill — soft enough that a full column of them stays readable. */
export const COVERAGE_CHIP_TONE: Record<ResolvedCoverageLevel, string> = {
  AVAILABLE: 'bg-success-soft text-success-foreground border-success/25',
  LIMITED: 'bg-warning-soft text-warning-foreground border-warning/25',
  UNAVAILABLE:
    'bg-destructive-soft text-destructive-foreground border-destructive/25',
  UNKNOWN: 'bg-muted text-muted-foreground border-border',
};

/** Solid dot for the legend and the help sheet. */
export const COVERAGE_DOT_TONE: Record<ResolvedCoverageLevel, string> = {
  AVAILABLE: 'bg-success',
  LIMITED: 'bg-warning',
  UNAVAILABLE: 'bg-destructive',
  UNKNOWN: 'bg-muted-foreground/40',
};
