'use client';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/Collapsible';
import {
  Building2,
  ChevronDown,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Phone,
  Siren,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  COVERAGE_META,
  type ClinicLocation,
  type ClinicalServiceCoverage,
  type ResolvedCoverageLevel,
} from '../types';
import {
  groupLocationsByCity,
  summarizeAreaCoverage,
  type AreaCoverageSummary,
} from '../utils/coverageSummary';
import {
  COVERAGE_CHIP_TONE,
  COVERAGE_DISPLAY_ORDER,
  COVERAGE_DOT_TONE,
} from '../utils/coverageTone';

interface CoverageLocationBoardProps {
  locations: ClinicLocation[];
  rows: ClinicalServiceCoverage[];
  /** Active clinical services — the denominator for every rollup. */
  serviceIds: string[];
  onEdit: (location: ClinicLocation) => void;
  onDelete: (location: ClinicLocation) => void;
}

/**
 * Branches grouped by city, each carrying its own coverage rollup.
 *
 * The grid answers "is this service covered there?" one cell at a time. This
 * answers the question a coordinator actually opens the page with — what does
 * this branch cover, and how much of it is still unanswered — which a flat
 * list of twenty branches cannot.
 */
export function CoverageLocationBoard({
  locations,
  rows,
  serviceIds,
  onEdit,
  onDelete,
}: Readonly<CoverageLocationBoardProps>) {
  const cityGroups = groupLocationsByCity(locations);
  // Every city starts open; collapsing is remembered per city while the tab lives.
  const [collapsedCities, setCollapsedCities] = useState<Set<string>>(new Set());

  const toggleCity = (city: string) =>
    setCollapsedCities((previous) => {
      const next = new Set(previous);
      if (next.has(city)) next.delete(city);
      else next.add(city);
      return next;
    });

  return (
    <div className="space-y-3">
      {cityGroups.map(({ city, locations: cityLocations }) => {
        const isOpen = !collapsedCities.has(city);
        const emergencyCount = cityLocations.filter(
          (location) => location.handlesEmergencies && location.isActive,
        ).length;

        return (
          <Collapsible
            key={city}
            open={isOpen}
            onOpenChange={() => toggleCity(city)}
            className="bg-card overflow-hidden rounded-xl border shadow-xs"
          >
            <CollapsibleTrigger
              className={cn(
                'bg-muted/40 hover:bg-muted/70 flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors',
                isOpen && 'border-b',
              )}
            >
              <ChevronDown
                className={cn(
                  'text-muted-foreground size-4 shrink-0 transition-transform',
                  !isOpen && '-rotate-90',
                )}
              />
              <Building2 className="text-muted-foreground size-4 shrink-0" />
              <span className="font-medium">{city}</span>
              <span className="text-muted-foreground text-sm">
                {cityLocations.length}{' '}
                {cityLocations.length === 1 ? 'branch' : 'branches'}
              </span>
              {emergencyCount > 0 && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Siren className="size-3" />
                  {emergencyCount} emergency
                </Badge>
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="divide-y">
                {cityLocations.map((location) => (
                  <LocationRow
                    key={location.id}
                    location={location}
                    summary={summarizeAreaCoverage({
                      location,
                      rows,
                      serviceIds,
                    })}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

function LocationRow({
  location,
  summary,
  onEdit,
  onDelete,
}: Readonly<{
  location: ClinicLocation;
  summary: AreaCoverageSummary;
  onEdit: (location: ClinicLocation) => void;
  onDelete: (location: ClinicLocation) => void;
}>) {
  return (
    <div
      className={cn(
        'hover:bg-muted/30 flex flex-wrap items-start justify-between gap-3 p-3 transition-colors',
        !location.isActive && 'bg-muted/20',
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {location.branchName || location.area || location.city}
          </span>
          <Badge variant="outline" className="font-normal">
            {location.area ?? 'Whole city'}
          </Badge>
          {location.handlesEmergencies && (
            <Badge variant="secondary" className="gap-1 font-normal">
              <Siren className="size-3" />
              Emergencies
            </Badge>
          )}
          {location.isOpen24x7 && (
            <Badge variant="secondary" className="gap-1 font-normal">
              <Clock className="size-3" />
              24/7
            </Badge>
          )}
          {!location.isActive && (
            <Badge variant="destructive" className="font-normal">
              Inactive
            </Badge>
          )}
        </div>

        {location.addressLine && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPin className="size-3 shrink-0" />
            {location.addressLine}
          </p>
        )}

        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          {location.contactPhone && (
            <span className="flex items-center gap-1">
              <Phone className="size-3" />
              {location.contactPhone}
            </span>
          )}
          {location.mapsUrl && (
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-primary flex items-center gap-1 underline"
            >
              <ExternalLink className="size-3" />
              Map
            </a>
          )}
        </div>

        <CoverageRollup summary={summary} />
      </div>

      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" onClick={() => onEdit(location)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Remove ${location.branchName || location.city}`}
          onClick={() => onDelete(location)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

/** One line of counts per coverage level, skipping levels with nothing in them. */
function CoverageRollup({ summary }: Readonly<{ summary: AreaCoverageSummary }>) {
  if (summary.total === 0) {
    return (
      <p className="text-muted-foreground text-xs">
        No active services to cover yet.
      </p>
    );
  }

  const levels = COVERAGE_DISPLAY_ORDER.filter(
    (level: ResolvedCoverageLevel) => summary[level] > 0,
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
      {levels.map((level) => (
        <span
          key={level}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium',
            COVERAGE_CHIP_TONE[level],
          )}
        >
          <span
            aria-hidden
            className={cn('size-1.5 rounded-full', COVERAGE_DOT_TONE[level])}
          />
          <span className="tabular-nums">{summary[level]}</span>
          {COVERAGE_META[level].label.toLowerCase()}
        </span>
      ))}
      <span className="text-muted-foreground">
        of {summary.total} {summary.total === 1 ? 'service' : 'services'}
      </span>
    </div>
  );
}
