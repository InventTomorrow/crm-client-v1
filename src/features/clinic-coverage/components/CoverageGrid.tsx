'use client';
import { cn } from '@/lib/utils';
import { NativeSelect } from '@/shared/ui/NativeSelect';
import type { ClinicalService } from '@/features/clinical-services/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { coverageCellKey } from '../hooks/useClinicCoverage';
import {
  areaKey,
  areaLabel,
  COVERAGE_META,
  COVERAGE_LEVELS,
  type ClinicalServiceCoverage,
  type CoverageArea,
  type CoverageCellStatus,
  type CoverageLevel,
  type ResolvedCoverageLevel,
} from '../types';

interface CoverageGridProps {
  services: ClinicalService[];
  areas: CoverageArea[];
  rows: ClinicalServiceCoverage[];
  /** Keyed by `coverageCellKey` — only the cells currently saving or failed. */
  cellStatus: Record<string, CoverageCellStatus>;
  onChange: (params: {
    service: ClinicalService;
    area: CoverageArea;
    coverage: CoverageLevel | 'UNKNOWN';
  }) => void;
}

const CELL_TONE: Record<ResolvedCoverageLevel, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  LIMITED: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  UNAVAILABLE: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  UNKNOWN: 'text-muted-foreground',
};

/**
 * Service × city/area coverage.
 *
 * A blank cell is meaningful, not merely unfilled: it resolves to UNKNOWN, which
 * makes the assistant say coverage is unconfirmed and hand off. That is why
 * "Not set" is an explicit option rather than something you reach by clearing.
 */
export function CoverageGrid({
  services,
  areas,
  rows,
  cellStatus,
  onChange,
}: Readonly<CoverageGridProps>) {
  const rowByCell = new Map(
    rows.map((row) => [coverageCellKey(row.clinicalServiceId, row), row]),
  );

  const levelFor = (
    serviceId: string,
    area: CoverageArea,
  ): ResolvedCoverageLevel => {
    const row = rowByCell.get(coverageCellKey(serviceId, area));
    return row?.isActive ? row.coverage : 'UNKNOWN';
  };

  return (
    // Wide grids scroll inside their own container rather than the page. The
    // header sticks to the top of that container so the city a column belongs
    // to stays readable once a clinic has more services than fit on screen.
    <div className="max-h-[70vh] overflow-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-20">
          <tr>
            <th className="bg-muted sticky left-0 z-30 min-w-[180px] border-b border-r p-2 text-left font-medium">
              Service
            </th>
            {areas.map((area) => (
              <th
                key={areaKey(area.city, area.area)}
                className="bg-muted min-w-[150px] border-b border-r p-2 text-left font-medium last:border-r-0"
              >
                {areaLabel(area)}
                {!area.area && (
                  <span className="text-muted-foreground block text-xs font-normal">
                    whole city
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b last:border-b-0">
              <td className="sticky left-0 z-10 border-r bg-[var(--surface)] p-2 align-middle font-medium">
                <Link
                  href={`/clinical-services/${service.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {service.name}
                </Link>
              </td>
              {areas.map((area) => {
                const level = levelFor(service.id, area);
                const status = cellStatus[coverageCellKey(service.id, area)];
                const isSaving = status === 'saving';

                return (
                  <td
                    key={areaKey(area.city, area.area)}
                    className={cn(
                      'relative border-r p-1.5 align-middle last:border-r-0',
                      CELL_TONE[level],
                      status === 'error' &&
                        'ring-destructive bg-destructive/5 ring-1 ring-inset',
                    )}
                  >
                    <NativeSelect
                      size="sm"
                      className={cn('w-full', isSaving && 'opacity-60')}
                      aria-label={`${service.name} in ${areaLabel(area)}`}
                      aria-busy={isSaving}
                      value={level}
                      // Only this cell locks, and only while its own save is in
                      // flight — the row it is creating has no server id yet,
                      // so a second change would have nothing to delete.
                      disabled={isSaving}
                      onChange={(event) =>
                        onChange({
                          service,
                          area,
                          coverage: event.target.value as
                            | CoverageLevel
                            | 'UNKNOWN',
                        })
                      }
                    >
                      <option value="UNKNOWN">
                        {COVERAGE_META.UNKNOWN.label}
                      </option>
                      {COVERAGE_LEVELS.map((option) => (
                        <option key={option} value={option}>
                          {COVERAGE_META[option].label}
                        </option>
                      ))}
                    </NativeSelect>

                    {isSaving && (
                      <Loader2 className="text-muted-foreground pointer-events-none absolute top-1/2 right-7 size-3.5 -translate-y-1/2 animate-spin" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
