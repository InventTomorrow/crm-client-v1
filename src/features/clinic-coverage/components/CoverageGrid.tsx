'use client';
import type { ClinicalService } from '@/features/clinical-services/types';
import Link from 'next/link';
import { coverageCellKey } from '../hooks/useClinicCoverage';
import {
  areaKey,
  areaLabel,
  type CoverageArea,
  type CoverageCellStatus,
} from '../types';
import type { CoverageLookup } from '../utils/coverageLookup';
import { CoverageStatusControl } from './CoverageStatusChip';
import type { CoverageCellTarget } from './CoverageStatusDialog';

interface CoverageGridProps {
  services: ClinicalService[];
  areas: CoverageArea[];
  lookup: CoverageLookup;
  /** Keyed by `coverageCellKey` — only the cells currently saving or failed. */
  cellStatus: Record<string, CoverageCellStatus>;
  onEditCell: (target: CoverageCellTarget) => void;
}

/**
 * Service × city/area coverage.
 *
 * A blank cell is meaningful, not merely unfilled: it resolves to UNKNOWN, which
 * makes the assistant say coverage is unconfirmed and hand off. That is why
 * "Not set" is an explicit status rather than something you reach by clearing.
 */
export function CoverageGrid({
  services,
  areas,
  lookup,
  cellStatus,
  onEditCell,
}: Readonly<CoverageGridProps>) {
  return (
    // Wide grids scroll inside their own container rather than the page. The
    // header sticks to the top of that container so the city a column belongs
    // to stays readable once a clinic has more services than fit on screen.
    <div className="bg-card max-h-[70vh] overflow-auto rounded-xl border shadow-xs">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-20">
          <tr>
            <th className="bg-muted sticky left-0 z-30 min-w-[180px] border-r border-b p-2.5 text-left font-medium">
              Service
            </th>
            {areas.map((area) => (
              <th
                key={areaKey(area.city, area.area)}
                className="bg-muted min-w-[170px] border-r border-b p-2.5 text-left font-medium last:border-r-0"
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
            <tr
              key={service.id}
              className="hover:bg-muted/30 border-b transition-colors last:border-b-0"
            >
              <td className="bg-card sticky left-0 z-10 border-r p-2.5 align-middle font-medium">
                <Link
                  href={`/clinical-services/${service.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {service.name}
                </Link>
              </td>
              {areas.map((area) => {
                const level = lookup.levelFor(service.id, area);

                return (
                  <td
                    key={areaKey(area.city, area.area)}
                    className="border-r p-1.5 align-middle last:border-r-0"
                  >
                    <CoverageStatusControl
                      level={level}
                      label={`${service.name} in ${areaLabel(area)}`}
                      status={cellStatus[coverageCellKey(service.id, area)]}
                      onEdit={() => onEditCell({ service, area, level })}
                    />
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
