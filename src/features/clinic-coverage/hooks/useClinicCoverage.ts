'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
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
import type { ClinicLocationFormValues, CoverageRowValues } from '../types';

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

/** Single-cell edit from the grid. */
export function useUpsertCoverageRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CoverageRowValues) => upsertCoverageRow(payload),
    onSuccess: () => invalidateCoverage(queryClient),
    onError: (error) => toast.error(extractErrorMessage(error)),
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
    onSuccess: () => invalidateCoverage(queryClient),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
