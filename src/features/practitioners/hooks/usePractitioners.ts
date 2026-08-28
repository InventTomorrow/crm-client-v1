'use client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  addPractitionerTimeOff,
  createPractitioner,
  deletePractitioner,
  getPractitioner,
  getPractitionerPreview,
  getPractitioners,
  getPractitionerTimeOff,
  removePractitionerTimeOff,
  updatePractitioner,
  type CreatePractitionerPayload,
  type UpdatePractitionerPayload,
} from '../services/practitionersService';
import type { PractitionerFilters } from '../types';

export const PRACTITIONERS_PAGE_SIZE = 10;

const practitionerKeys = {
  all: ['practitioners'] as const,
  list: (filters: PractitionerFilters) =>
    ['practitioners', 'list', filters] as const,
  detail: (practitionerId: string) =>
    ['practitioners', 'detail', practitionerId] as const,
  preview: (practitionerId: string) =>
    ['practitioners', 'preview', practitionerId] as const,
  timeOff: (practitionerId: string) =>
    ['practitioners', practitionerId, 'time-off'] as const,
};

function invalidatePractitioners(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: practitionerKeys.all });
}

/**
 * The listing screen's source. The endpoint returns a bare array, so a full page
 * is the signal that another cursor exists — a short page means the end.
 */
export function useInfinitePractitioners(
  filters: PractitionerFilters = {},
  /** Held back where the caller only needs the list once something is open. */
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    enabled: options?.enabled ?? true,
    queryKey: practitionerKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getPractitioners({
        ...filters,
        cursor: pageParam,
        limit: PRACTITIONERS_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PRACTITIONERS_PAGE_SIZE
        ? lastPage[lastPage.length - 1]?.id
        : undefined,
  });
}

export function usePractitioner(practitionerId: string | undefined) {
  return useQuery({
    queryKey: practitionerKeys.detail(practitionerId ?? ''),
    queryFn: () => getPractitioner(practitionerId!),
    enabled: Boolean(practitionerId),
  });
}

/** How the assistant resolves this practitioner, for the preview panel. */
export function usePractitionerPreview(practitionerId: string | undefined) {
  return useQuery({
    queryKey: practitionerKeys.preview(practitionerId ?? ''),
    queryFn: () => getPractitionerPreview(practitionerId!),
    enabled: Boolean(practitionerId),
  });
}

export function useCreatePractitioner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePractitionerPayload) =>
      createPractitioner(payload),
    onSuccess: () => {
      toast.success('Practitioner added');
      invalidatePractitioners(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdatePractitioner(practitionerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePractitionerPayload) =>
      updatePractitioner(practitionerId, payload),
    onSuccess: () => {
      toast.success('Practitioner updated');
      invalidatePractitioners(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeletePractitioner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (practitionerId: string) => deletePractitioner(practitionerId),
    onSuccess: () => {
      toast.success('Practitioner removed');
      invalidatePractitioners(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function usePractitionerTimeOff(practitionerId: string | undefined) {
  return useQuery({
    queryKey: practitionerKeys.timeOff(practitionerId ?? ''),
    queryFn: () => getPractitionerTimeOff(practitionerId!),
    enabled: Boolean(practitionerId),
  });
}

export function useAddTimeOff(practitionerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      startsAt: string;
      endsAt: string;
      reason?: string;
    }) => addPractitionerTimeOff(practitionerId, payload),
    onSuccess: () => {
      toast.success('Time off added');
      queryClient.invalidateQueries({
        queryKey: practitionerKeys.timeOff(practitionerId),
      });
      // Blocked time changes what the calendar can offer.
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useRemoveTimeOff(practitionerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timeOffId: string) =>
      removePractitionerTimeOff(practitionerId, timeOffId),
    onSuccess: () => {
      toast.success('Time off removed');
      queryClient.invalidateQueries({
        queryKey: practitionerKeys.timeOff(practitionerId),
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
