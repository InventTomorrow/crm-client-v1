import { coverageCellKey } from '../hooks/useClinicCoverage';
import type {
  ClinicalServiceCoverage,
  CoverageArea,
  ResolvedCoverageLevel,
} from '../types';

export interface CoverageLookup {
  rowFor: (
    serviceId: string,
    area: CoverageArea,
  ) => ClinicalServiceCoverage | undefined;
  levelFor: (serviceId: string, area: CoverageArea) => ResolvedCoverageLevel;
}

/**
 * One pass over the coverage rows so the matrix, the cards and the edit dialog
 * all read a cell the same way — including the rule that an inactive row is
 * `UNKNOWN`, not a stored "no".
 */
export function buildCoverageLookup(
  rows: ClinicalServiceCoverage[],
): CoverageLookup {
  const rowByCell = new Map(
    rows.map((row) => [coverageCellKey(row.clinicalServiceId, row), row]),
  );

  const rowFor = (serviceId: string, area: CoverageArea) =>
    rowByCell.get(coverageCellKey(serviceId, area));

  return {
    rowFor,
    levelFor: (serviceId, area) => {
      const row = rowFor(serviceId, area);
      return row?.isActive ? row.coverage : 'UNKNOWN';
    },
  };
}
