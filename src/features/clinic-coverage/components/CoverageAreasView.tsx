'use client';
import { useClinicalServices } from '@/features/clinical-services/hooks/useClinicalServices';
import { Alert, AlertDescription } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { SearchField } from '@/shared/ui/SearchField';
import {
  CoverageLocationsSkeleton,
  CoverageMatrixSkeleton,
} from './CoverageSkeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/ToggleGroup';
import {
  HelpCircle,
  LayoutGrid,
  MapPin,
  Plus,
  SearchX,
  Siren,
  Table2,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useClinicLocations,
  useCoverageCells,
  useCoverageRows,
  useDeleteClinicLocation,
} from '../hooks/useClinicCoverage';
import { areaKey, type ClinicLocation, type CoverageArea } from '../types';
import {
  filterClinicLocations,
  filterCoverageGrid,
} from '../utils/filterCoverage';
import { buildCoverageLookup } from '../utils/coverageLookup';
import { ClinicLocationFormDialog } from './ClinicLocationFormDialog';
import { CoverageCsvImportDialog } from './CoverageCsvImportDialog';
import { CoverageGrid } from './CoverageGrid';
import { CoverageHelpSheet } from './CoverageHelpSheet';
import { CoverageLocationBoard } from './CoverageLocationBoard';
import { CoverageLegend } from './CoverageLegend';
import { CoverageServiceCards } from './CoverageServiceCards';
import {
  CoverageStatusDialog,
  type CoverageCellTarget,
} from './CoverageStatusDialog';

type CoverageTab = 'grid' | 'locations';
/** How the service × area coverage is laid out — same data, two shapes. */
type CoverageViewMode = 'matrix' | 'cards';

const COVERAGE_TAB_TRIGGER_CLASS =
  'h-full gap-2 px-3 text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] data-active:bg-[var(--surface-2)] data-active:text-[var(--ink)] data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-[var(--surface-2)] dark:data-active:text-[var(--ink)]';

const SEARCH_PLACEHOLDER: Record<CoverageTab, string> = {
  grid: 'Search a service, city or area…',
  locations: 'Search a branch, address, city or phone…',
};

export function CoverageAreasView() {
  const [activeTab, setActiveTab] = useState<CoverageTab>('grid');
  const [viewMode, setViewMode] = useState<CoverageViewMode>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [cellBeingEdited, setCellBeingEdited] =
    useState<CoverageCellTarget | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [locationBeingEdited, setLocationBeingEdited] =
    useState<ClinicLocation | null>(null);
  const [locationPendingDeletion, setLocationPendingDeletion] =
    useState<ClinicLocation | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const locationsQuery = useClinicLocations();
  const coverageQuery = useCoverageRows();
  const servicesQuery = useClinicalServices({ isActive: true });

  const deleteLocation = useDeleteClinicLocation();

  const locations = useMemo(
    () => locationsQuery.data ?? [],
    [locationsQuery.data],
  );
  const services = useMemo(
    () => servicesQuery.data ?? [],
    [servicesQuery.data],
  );
  const rows = useMemo(() => coverageQuery.data ?? [], [coverageQuery.data]);

  // Grid columns come from the clinic's own location list, so the vocabulary is
  // theirs rather than whatever happens to exist in coverage rows.
  const areas: CoverageArea[] = useMemo(() => {
    const byKey = new Map<string, CoverageArea>();
    for (const location of locations) {
      if (!location.isActive) continue;
      byKey.set(areaKey(location.city, location.area), {
        city: location.city,
        area: location.area,
      });
    }
    return [...byKey.values()];
  }, [locations]);

  // The denominator for every branch's rollup — active services only.
  const serviceIds = useMemo(
    () => services.map((service) => service.id),
    [services],
  );

  const emergencyLocations = locations.filter(
    (location) => location.isActive && location.handlesEmergencies,
  );

  const { setCell, cellStatus } = useCoverageCells(rows);
  const lookup = useMemo(() => buildCoverageLookup(rows), [rows]);

  // The dialog names the branch behind a column, not just its city and area.
  const locationByArea = useMemo(
    () =>
      new Map(
        locations.map((location) => [
          areaKey(location.city, location.area),
          location,
        ]),
      ),
    [locations],
  );

  const visibleGrid = filterCoverageGrid({ services, areas, searchTerm });
  const visibleLocations = filterClinicLocations(locations, searchTerm);

  const isLoading = locationsQuery.isLoading || servicesQuery.isLoading;
  const hasGridData = services.length > 0 && areas.length > 0;

  const openCreateLocation = () => {
    setLocationBeingEdited(null);
    setIsLocationFormOpen(true);
  };

  const clearSearch = () => setSearchTerm('');

  const noMatches = (label: string) => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-14 text-center">
      <SearchX className="text-muted-foreground size-7" />
      <p className="text-sm font-medium">No {label} match “{searchTerm.trim()}”</p>
      <Button size="sm" variant="outline" onClick={clearSearch}>
        Clear search
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div
        data-tour="page-actions"
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Coverage areas</h1>
          <p className="text-muted-foreground text-sm">
            Where the clinic operates, and which services it offers in each
            place.
          </p>
        </div>
        <div className="flex gap-2">
          {/* The explainer is read once, so it lives here rather than taking a
              permanent block above the grid. */}
          <Button
            variant="outline"
            size="icon"
            title="How coverage works"
            aria-label="How coverage works"
            onClick={() => setIsHelpOpen(true)}
          >
            <HelpCircle className="size-4" />
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="size-4" />
            Import
          </Button>
          <Button onClick={openCreateLocation}>
            <Plus className="size-4" />
            Add location
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(nextTab) => setActiveTab(nextTab as CoverageTab)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-11 gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1">
            <TabsTrigger value="grid" className={COVERAGE_TAB_TRIGGER_CLASS}>
              <Table2 className="size-4" />
              Service coverage
              <TabCount value={services.length} />
            </TabsTrigger>
            <TabsTrigger value="locations" className={COVERAGE_TAB_TRIGGER_CLASS}>
              <MapPin className="size-4" />
              Locations by city
              <TabCount value={locations.length} />
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            {activeTab === 'grid' && (
              <ToggleGroup
                type="single"
                variant="outline"
                size="lg"
                spacing={0}
                value={viewMode}
                // Radix clears the value when the active item is pressed again.
                onValueChange={(nextMode) =>
                  nextMode && setViewMode(nextMode as CoverageViewMode)
                }
                aria-label="Coverage layout"
              >
                <ToggleGroupItem value="matrix" aria-label="Matrix" className="h-10">
                  <Table2 className="size-4" />
                  Matrix
                </ToggleGroupItem>
                <ToggleGroupItem value="cards" aria-label="Cards" className="h-10">
                  <LayoutGrid className="size-4" />
                  Cards
                </ToggleGroupItem>
              </ToggleGroup>
            )}

            <SearchField
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder={SEARCH_PLACEHOLDER[activeTab]}
              aria-label="Search coverage"
              className="w-full sm:w-auto sm:min-w-[260px]"
            />
          </div>
        </div>

        <TabsContent value="grid" className="space-y-4 pt-4">
          {isLoading && <CoverageMatrixSkeleton />}

          {!isLoading && !hasGridData && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
              <MapPin className="text-muted-foreground size-8" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {services.length === 0
                    ? 'No services yet'
                    : 'No locations yet'}
                </p>
                <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                  {services.length === 0 ? (
                    <>
                      The grid needs services to put in its rows.{' '}
                      <Link
                        href="/clinical-services"
                        className="text-primary underline"
                      >
                        Add a service
                      </Link>{' '}
                      first.
                    </>
                  ) : (
                    'Add the cities and areas the clinic serves — they become the columns here.'
                  )}
                </p>
              </div>
              {services.length > 0 && (
                <Button onClick={openCreateLocation}>
                  <Plus className="size-4" />
                  Add location
                </Button>
              )}
            </div>
          )}

          {!isLoading &&
            hasGridData &&
            visibleGrid.services.length === 0 &&
            noMatches('services or areas')}

          {!isLoading && hasGridData && visibleGrid.services.length > 0 && (
            <>
              {viewMode === 'matrix' ? (
                <CoverageGrid
                  services={visibleGrid.services}
                  areas={visibleGrid.areas}
                  lookup={lookup}
                  cellStatus={cellStatus}
                  onEditCell={setCellBeingEdited}
                />
              ) : (
                <CoverageServiceCards
                  services={visibleGrid.services}
                  areas={visibleGrid.areas}
                  lookup={lookup}
                  cellStatus={cellStatus}
                  onEditCell={setCellBeingEdited}
                />
              )}
              <CoverageLegend className="max-w-2xl" />
            </>
          )}
        </TabsContent>

        <TabsContent value="locations" className="space-y-3 pt-4">
          {emergencyLocations.length === 0 && locations.length > 0 && (
            <Alert>
              <Siren className="size-4" />
              <AlertDescription>
                <p>
                  No location handles emergencies. If the clinic&apos;s emergency
                  policy is set to direct patients to a branch, it will safely
                  fall back to telling them to go to the nearest emergency
                  department instead.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {locationsQuery.isLoading && <CoverageLocationsSkeleton />}

          {!locationsQuery.isLoading && locations.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
              <MapPin className="text-muted-foreground size-8" />
              <p className="text-sm font-medium">No locations yet</p>
              <Button onClick={openCreateLocation}>
                <Plus className="size-4" />
                Add location
              </Button>
            </div>
          )}

          {!locationsQuery.isLoading &&
            locations.length > 0 &&
            visibleLocations.length === 0 &&
            noMatches('locations')}

          {visibleLocations.length > 0 && (
            <CoverageLocationBoard
              locations={visibleLocations}
              rows={rows}
              serviceIds={serviceIds}
              onEdit={(location) => {
                setLocationBeingEdited(location);
                setIsLocationFormOpen(true);
              }}
              onDelete={setLocationPendingDeletion}
            />
          )}
        </TabsContent>
      </Tabs>

      <CoverageStatusDialog
        target={cellBeingEdited}
        location={
          cellBeingEdited
            ? (locationByArea.get(
                areaKey(
                  cellBeingEdited.area.city,
                  cellBeingEdited.area.area,
                ),
              ) ?? null)
            : null
        }
        onOpenChange={(isOpen) => !isOpen && setCellBeingEdited(null)}
        onSubmit={setCell}
      />

      <CoverageHelpSheet open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      <ClinicLocationFormDialog
        open={isLocationFormOpen}
        onOpenChange={setIsLocationFormOpen}
        location={locationBeingEdited}
      />

      <CoverageCsvImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        services={services}
      />

      <ConfirmDialog
        open={locationPendingDeletion !== null}
        onClose={() => setLocationPendingDeletion(null)}
        title="Remove this location?"
        description={
          locationPendingDeletion
            ? `${locationPendingDeletion.area ? `${locationPendingDeletion.area}, ` : ''}${locationPendingDeletion.city} will disappear from the coverage grid. Existing coverage rows for it are kept but no longer shown.`
            : ''
        }
        confirmLabel="Remove"
        loading={deleteLocation.isPending}
        onConfirm={() => {
          if (locationPendingDeletion)
            deleteLocation.mutate(locationPendingDeletion.id);
          setLocationPendingDeletion(null);
        }}
      />
    </div>
  );
}

/** How many rows or locations sit behind a tab, without leaving the label. */
function TabCount({ value }: Readonly<{ value: number }>) {
  return (
    <span className="bg-muted-foreground/15 rounded-full px-1.5 py-px text-[10px] font-medium tabular-nums">
      {value}
    </span>
  );
}
