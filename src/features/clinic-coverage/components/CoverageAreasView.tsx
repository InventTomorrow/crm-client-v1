'use client';
import { useClinicalServices } from '@/features/clinical-services/hooks/useClinicalServices';
import { Alert, AlertDescription } from '@/shared/ui/Alert';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import {
  Info,
  MapPin,
  Pencil,
  Plus,
  Siren,
  Trash2,
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
import {
  areaKey,
  COVERAGE_META,
  type ClinicLocation,
  type CoverageArea,
} from '../types';
import { ClinicLocationFormDialog } from './ClinicLocationFormDialog';
import { CoverageCsvImportDialog } from './CoverageCsvImportDialog';
import { CoverageGrid } from './CoverageGrid';

export function CoverageAreasView() {
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

  const emergencyLocations = locations.filter(
    (location) => location.isActive && location.handlesEmergencies,
  );

  const { setCell, cellStatus } = useCoverageCells(rows);

  const openCreateLocation = () => {
    setLocationBeingEdited(null);
    setIsLocationFormOpen(true);
  };

  const isLoading = locationsQuery.isLoading || servicesQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Coverage areas</h1>
          <p className="text-muted-foreground text-sm">
            Where the clinic operates, and which services it offers in each
            place.
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* The distinction the whole feature turns on. */}
      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          Coverage tells the assistant the clinic <strong>operates</strong>{' '}
          somewhere. It is never a promise that staff are free — the assistant
          always says a coordinator will confirm, and anything other than
          &ldquo;Available&rdquo; is handed to a human.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Service coverage</TabsTrigger>
          <TabsTrigger value="locations">
            Locations ({locations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-3 pt-4">
          {isLoading && <Skeleton className="h-64 w-full" />}

          {!isLoading && (services.length === 0 || areas.length === 0) && (
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

          {!isLoading && services.length > 0 && areas.length > 0 && (
            <>
              <CoverageGrid
                services={services}
                areas={areas}
                rows={rows}
                cellStatus={cellStatus}
                onChange={setCell}
              />
              <div className="flex flex-wrap gap-3 text-xs">
                {(
                  ['AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN'] as const
                ).map((level) => (
                  <span key={level} className="text-muted-foreground">
                    <strong className="text-foreground">
                      {COVERAGE_META[level].label}
                    </strong>{' '}
                    — {COVERAGE_META[level].description}
                  </span>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="locations" className="space-y-3 pt-4">
          {emergencyLocations.length === 0 && locations.length > 0 && (
            <Alert>
              <Siren className="size-4" />
              <AlertDescription>
                No location handles emergencies. If the clinic&apos;s emergency
                policy is set to direct patients to a branch, it will safely
                fall back to telling them to go to the nearest emergency
                department instead.
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

          {locations.map((location) => (
            <div
              key={location.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {location.branchName || location.city}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {location.area
                      ? `${location.area}, ${location.city}`
                      : location.city}
                  </span>
                  {location.handlesEmergencies && (
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Siren className="size-3" />
                      Emergencies
                    </Badge>
                  )}
                  {!location.isActive && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                {location.contactPhone && (
                  <p className="text-muted-foreground text-xs">
                    {location.contactPhone}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLocationBeingEdited(location);
                    setIsLocationFormOpen(true);
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setLocationPendingDeletion(location)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

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
