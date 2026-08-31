'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import type { ClinicalService } from '@/features/clinical-services/types';
import {
  bulkUpsertCoverage,
  createClinicLocation,
  deleteClinicLocation,
  deleteCoverageRow,
  getClinicLocations,
  getCoverageRows,
  updateClinicLocation,
  upsertCoverageRow,
} from '../services/clinicCoverageService';
import {
  areaKey,
  type ClinicalServiceCoverage,
  type ClinicLocationFormValues,
  type CoverageArea,
  type CoverageCellStatus,
  type CoverageLevel,
  type CoverageRowValues,
} from '../types';

/** Marks a cache row the server has not acknowledged yet. */
const OPTIMISTIC_ID_PREFIX = 'optimistic:';

/** One cell of the grid: a service in a city/area. */
export const coverageCellKey = (
  clinicalServiceId: string,
  area: { city: string; area: string | null },
): string => `${clinicalServiceId}|${areaKey(area.city, area.area)}`;

const coverageKeys = {
  all: ['clinic-coverage'] as const,
  locations: ['clinic-coverage', 'locations'] as const,
  rows: ['clinic-coverage', 'rows'] as const,
};

function invalidateCoverage(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: coverageKeys.all });
}

export function useClinicLocations() {
  return useQuery({
    queryKey: coverageKeys.locations,
    queryFn: () => getClinicLocations(),
  });
}

export function useCoverageRows() {
  return useQuery({
    queryKey: coverageKeys.rows,
    queryFn: () => getCoverageRows(),
  });
}

export function useCreateClinicLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClinicLocationFormValues) =>
      createClinicLocation(payload),
    onSuccess: () => {
      toast.success('Location added');
      invalidateCoverage(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateClinicLocation(locationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ClinicLocationFormValues>) =>
      updateClinicLocation(locationId, payload),
    onSuccess: () => {
      toast.success('Location updated');
      invalidateCoverage(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteClinicLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) => deleteClinicLocation(locationId),
    onSuccess: () => {
      toast.success('Location removed');
      invalidateCoverage(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/**
 * Optimistically writes one cell into the cached row list.
 *
 * Returns the rows as they were, so the caller can put them back if the save
 * fails. An unsaved row gets a temporary id — the grid disables a cell while
 * its own save is in flight, so that id is never sent back as a delete target.
 */
function applyOptimisticRow(
  queryClient: ReturnType<typeof useQueryClient>,
  payload: CoverageRowValues,
): ClinicalServiceCoverage[] | undefined {
  const previousRows = queryClient.getQueryData<ClinicalServiceCoverage[]>(
    coverageKeys.rows,
  );
  if (!previousRows) return undefined;

  const cellKey = coverageCellKey(payload.clinicalServiceId, {
    city: payload.city,
    area: payload.area ?? null,
  });
  const existing = previousRows.find(
    (row) =>
      coverageCellKey(row.clinicalServiceId, row) === cellKey,
  );

  const optimisticRow: ClinicalServiceCoverage = {
    ...(existing ?? {
      id: `${OPTIMISTIC_ID_PREFIX}${cellKey}`,
      tenantId: '',
      createdAt: new Date().toISOString(),
    }),
    clinicalServiceId: payload.clinicalServiceId,
    city: payload.city,
    area: payload.area ?? null,
    coverage: payload.coverage,
    priceMin: payload.priceMin ?? null,
    priceMax: payload.priceMax ?? null,
    currency: payload.currency,
    leadTimeNote: payload.leadTimeNote ?? null,
    notes: payload.notes ?? null,
    isActive: payload.isActive,
    updatedAt: new Date().toISOString(),
  } as ClinicalServiceCoverage;

  queryClient.setQueryData<ClinicalServiceCoverage[]>(
    coverageKeys.rows,
    existing
      ? previousRows.map((row) => (row.id === existing.id ? optimisticRow : row))
      : [...previousRows, optimisticRow],
  );

  return previousRows;
}

/** Single-cell edit from the grid. */
export function useUpsertCoverageRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CoverageRowValues) => upsertCoverageRow(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: coverageKeys.rows });
      return { previousRows: applyOptimisticRow(queryClient, payload) };
    },
    onError: (error, _payload, context) => {
      if (context?.previousRows) {
        queryClient.setQueryData(coverageKeys.rows, context.previousRows);
      }
      toast.error(extractErrorMessage(error));
    },
    onSettled: () => invalidateCoverage(queryClient),
  });
}

/** Whole-grid save, and the target for CSV import. */
export function useBulkUpsertCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: CoverageRowValues[]) => bulkUpsertCoverage(rows),
    onSuccess: (rows) => {
      toast.success(
        `${rows.length} coverage row${rows.length === 1 ? '' : 's'} saved`,
      );
      invalidateCoverage(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteCoverageRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coverageId: string) => deleteCoverageRow(coverageId),
    onMutate: async (coverageId) => {
      await queryClient.cancelQueries({ queryKey: coverageKeys.rows });
      const previousRows = queryClient.getQueryData<ClinicalServiceCoverage[]>(
        coverageKeys.rows,
      );
      if (previousRows) {
        queryClient.setQueryData<ClinicalServiceCoverage[]>(
          coverageKeys.rows,
          previousRows.filter((row) => row.id !== coverageId),
        );
      }
      return { previousRows };
    },
    onError: (error, _coverageId, context) => {
      if (context?.previousRows) {
        queryClient.setQueryData(coverageKeys.rows, context.previousRows);
      }
      toast.error(extractErrorMessage(error));
    },
    onSettled: () => invalidateCoverage(queryClient),
  });
}

/**
 * The grid's cell editor: one call per cell change, with the per-cell status
 * the grid needs to show what is happening to that cell and only that cell.
 *
 * Lives here rather than in the view because "what does changing a cell mean"
 * is the interesting part — in particular that "Not set" is a DELETE, since a
 * missing row is what makes the assistant say coverage is unconfirmed rather
 * than reading a stored "no".
 */
export function useCoverageCells(rows: ClinicalServiceCoverage[]) {
  const upsertRow = useUpsertCoverageRow();
  const deleteRow = useDeleteCoverageRow();
  const [cellStatus, setCellStatus] = useState<
    Record<string, CoverageCellStatus>
  >({});

  const markCell = (cellKey: string, status: CoverageCellStatus | null) =>
    setCellStatus((current) => {
      const next = { ...current };
      if (status) next[cellKey] = status;
      else delete next[cellKey];
      return next;
    });

  const setCell = ({
    service,
    area,
    coverage,
  }: {
    service: ClinicalService;
    area: CoverageArea;
    coverage: CoverageLevel | 'UNKNOWN';
  }) => {
    const cellKey = coverageCellKey(service.id, area);
    const existing = rows.find(
      (row) => coverageCellKey(row.clinicalServiceId, row) === cellKey,
    );

    // onSettled hands back (data, error) — reading the first argument as the
    // error marked every successful save as failed.
    const settle = (_data: unknown, error: unknown) =>
      markCell(cellKey, error ? 'error' : null);

    markCell(cellKey, 'saving');

    // "Not set" means no row at all — the assistant then reports coverage as
    // unconfirmed rather than reading a stored "no".
    if (coverage === 'UNKNOWN') {
      if (!existing) return markCell(cellKey, null);
      return deleteRow.mutate(existing.id, { onSettled: settle });
    }

    upsertRow.mutate(
      {
        clinicalServiceId: service.id,
        city: area.city,
        area: area.area,
        coverage,
        priceMin: existing?.priceMin ?? null,
        priceMax: existing?.priceMax ?? null,
        currency: existing?.currency ?? 'PKR',
        leadTimeNote: existing?.leadTimeNote ?? null,
        notes: existing?.notes ?? null,
        isActive: true,
      },
      { onSettled: settle },
    );
  };

  return { setCell, cellStatus };
}
