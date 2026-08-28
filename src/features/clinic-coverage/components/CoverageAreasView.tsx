'use client';
import { useClinicalServices } from '@/features/clinical-services/hooks/useClinicalServices';
import { Alert, AlertDescription } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { SearchField } from '@/shared/ui/SearchField';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import {
  HelpCircle,
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
import { ClinicLocationFormDialog } from './ClinicLocationFormDialog';
import { CoverageCsvImportDialog } from './CoverageCsvImportDialog';
import { CoverageGrid } from './CoverageGrid';
import { CoverageHelpSheet } from './CoverageHelpSheet';
import { CoverageLocationBoard } from './CoverageLocationBoard';
import { CoverageLegend } from './CoverageLegend';

type CoverageTab = 'grid' | 'locations';

const SEARCH_PLACEHOLDER: Record<CoverageTab, string> = {
  grid: 'Search a service, city or area…',
  locations: 'Search a branch, address, city or phone…',
};

export function CoverageAreasView() {
  const [activeTab, setActiveTab] = useState<CoverageTab>('grid');
  const [searchTerm, setSearchTerm] = useState('');
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
  const services = servicesQuery.data ?? [];
  const rows = coverageQuery.data ?? [];

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
      <div className="flex flex-wrap items-start justify-between gap-3">
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
          <TabsList className="h-9 p-1">
            <TabsTrigger value="grid" className="gap-2 px-3">
              <Table2 className="size-4" />
              Service coverage
              <TabCount value={services.length} />
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2 px-3">
              <MapPin className="size-4" />
              Locations by city
              <TabCount value={locations.length} />
            </TabsTrigger>
          </TabsList>

          <SearchField
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder={SEARCH_PLACEHOLDER[activeTab]}
            aria-label="Search coverage"
            className="min-w-[260px]"
          />
        </div>

        <TabsContent value="grid" className="space-y-4 pt-4">
          {isLoading && <Skeleton className="h-64 w-full" />}

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
              <CoverageGrid
                services={visibleGrid.services}
                areas={visibleGrid.areas}
                rows={rows}
                cellStatus={cellStatus}
                onChange={setCell}
              />
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

          {locationsQuery.isLoading && <Skeleton className="h-32 w-full" />}

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
