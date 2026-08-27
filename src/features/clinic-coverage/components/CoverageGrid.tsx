'use client';
import { cn } from '@/lib/utils';
import { NativeSelect } from '@/shared/ui/NativeSelect';
import type { ClinicalService } from '@/features/clinical-services/types';
import {
  areaKey,
  areaLabel,
  COVERAGE_META,
  COVERAGE_LEVELS,
  type ClinicalServiceCoverage,
  type CoverageArea,
  type CoverageLevel,
  type ResolvedCoverageLevel,
} from '../types';

interface CoverageGridProps {
  services: ClinicalService[];
  areas: CoverageArea[];
  rows: ClinicalServiceCoverage[];
  onChange: (params: {
    service: ClinicalService;
    area: CoverageArea;
    coverage: CoverageLevel | 'UNKNOWN';
  }) => void;
  disabled?: boolean;
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
  onChange,
  disabled,
}: CoverageGridProps) {
  const rowByCell = new Map(
    rows.map((row) => [
      `${row.clinicalServiceId}|${areaKey(row.city, row.area)}`,
      row,
    ]),
  );

  const levelFor = (
    serviceId: string,
    area: CoverageArea,
  ): ResolvedCoverageLevel => {
    const row = rowByCell.get(`${serviceId}|${areaKey(area.city, area.area)}`);
    return row?.isActive ? row.coverage : 'UNKNOWN';
  };

  return (
    // Wide grids scroll inside their own container rather than the page.
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="sticky left-0 z-10 min-w-[180px] border-b border-r bg-[var(--surface)] p-2 text-left font-medium">
              Service
            </th>
            {areas.map((area) => (
              <th
                key={areaKey(area.city, area.area)}
                className="min-w-[130px] border-b border-r p-2 text-left font-medium last:border-r-0"
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
                {service.name}
              </td>
              {areas.map((area) => {
                const level = levelFor(service.id, area);
                return (
                  <td
                    key={areaKey(area.city, area.area)}
                    className={cn(
                      'border-r p-1.5 align-middle last:border-r-0',
                      CELL_TONE[level],
                    )}
                  >
                    <NativeSelect
                      size="sm"
                      className="w-full"
                      aria-label={`${service.name} in ${areaLabel(area)}`}
                      value={level}
                      disabled={disabled}
                      onChange={(event) =>
                        onChange({
                          service,
                          area,
                          coverage: event.target.value as
                            CoverageLevel | 'UNKNOWN',
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
