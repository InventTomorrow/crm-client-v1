'use client';
import type { ClinicalService } from '@/features/clinical-services/types';
import { ChevronRight, MapPin } from 'lucide-react';
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

interface CoverageServiceCardsProps {
  services: ClinicalService[];
  areas: CoverageArea[];
  lookup: CoverageLookup;
  cellStatus: Record<string, CoverageCellStatus>;
  onEditCell: (target: CoverageCellTarget) => void;
}

/**
 * The same service × area coverage as the matrix, one card per service.
 *
 * The matrix is the right shape for scanning a whole clinic at once, but it
 * scrolls sideways the moment there are more than a few areas. These cards read
 * top to bottom, which is what a phone and a long area list both need.
 */
export function CoverageServiceCards({
  services,
  areas,
  lookup,
  cellStatus,
  onEditCell,
}: Readonly<CoverageServiceCardsProps>) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => {
        const answeredAreas = areas.filter(
          (area) => lookup.levelFor(service.id, area) !== 'UNKNOWN',
        ).length;

        return (
          <div
            key={service.id}
            className="bg-card flex flex-col rounded-xl border shadow-xs"
          >
            <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-t-xl border-b px-3 py-2.5">
              <Link
                href={`/clinical-services/${service.id}`}
                className="hover:text-primary group/link flex min-w-0 items-center gap-1 text-sm font-medium"
              >
                <span className="truncate">{service.name}</span>
                <ChevronRight className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
              </Link>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {answeredAreas}/{areas.length} set
              </span>
            </div>

            <ul className="divide-y">
              {areas.map((area) => (
                <li
                  key={areaKey(area.city, area.area)}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{areaLabel(area)}</span>
                  </span>
                  <CoverageStatusControl
                    level={lookup.levelFor(service.id, area)}
                    label={`${service.name} in ${areaLabel(area)}`}
                    status={cellStatus[coverageCellKey(service.id, area)]}
                    onEdit={() =>
                      onEditCell({
                        service,
                        area,
                        level: lookup.levelFor(service.id, area),
                      })
                    }
                    className="w-auto shrink-0"
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
