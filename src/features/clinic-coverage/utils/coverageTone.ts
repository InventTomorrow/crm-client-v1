import type { ResolvedCoverageLevel } from '../types';

/** The order statuses are read in — best case first, "no row at all" last. */
export const COVERAGE_DISPLAY_ORDER: ResolvedCoverageLevel[] = [
  'AVAILABLE',
  'LIMITED',
  'UNAVAILABLE',
  'UNKNOWN',
];

/** Grid cell fill — soft enough that a full column stays readable. */
export const COVERAGE_CELL_TONE: Record<ResolvedCoverageLevel, string> = {
  AVAILABLE: 'bg-success-soft text-success-foreground',
  LIMITED: 'bg-warning-soft text-warning-foreground',
  UNAVAILABLE: 'bg-destructive-soft text-destructive-foreground',
  UNKNOWN: 'text-muted-foreground',
};

/** Solid dot for the legend and the help sheet. */
export const COVERAGE_DOT_TONE: Record<ResolvedCoverageLevel, string> = {
  AVAILABLE: 'bg-success',
  LIMITED: 'bg-warning',
  UNAVAILABLE: 'bg-destructive',
  UNKNOWN: 'bg-muted-foreground/40',
};
