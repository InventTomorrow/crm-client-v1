'use client';
import { extractErrorMessage } from '@/lib/utils';
import {
  useInfiniteQuery,
  useIsFetching,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  assignCustomizationRequest,
  deleteCustomizationRequest,
  getCustomizationRequest,
  getCustomizationRequests,
  getCustomizationRequestsSummary,
  updateCustomizationRequestNote,
  updateCustomizationRequestStatus,
} from '../services/customizationRequestsService';
import type {
  CustomizationRequest,
  CustomizationRequestFilters,
  ReviewableStatus,
} from '../types';

const PAGE_SIZE = 25;

const keys = {
  all: ['customization-requests'] as const,
  list: (filters: CustomizationRequestFilters) =>
    ['customization-requests', 'list', filters] as const,
  summary: ['customization-requests', 'summary'] as const,
  detail: (id: string) => ['customization-requests', 'detail', id] as const,
};

type RequestPages = InfiniteData<CustomizationRequest[], string | undefined>;

export function useCustomizationRequests(filters: CustomizationRequestFilters) {
  return useInfiniteQuery({
    queryKey: keys.list(filters),
    queryFn: ({ pageParam }) =>
      getCustomizationRequests({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE
        ? lastPage[lastPage.length - 1]?.id
        : undefined,
  });
}

export function useCustomizationRequestsSummary() {
  return useQuery({
    queryKey: keys.summary,
    queryFn: getCustomizationRequestsSummary,
  });
}

/** Drives the "needs follow-up" count on the orders page tab. */
export function useOpenCustomizationRequestsCount() {
  return useQuery({
    queryKey: keys.summary,
    queryFn: getCustomizationRequestsSummary,
    select: (summary) => summary.open,
    refetchInterval: 300_000,
  });
}

export function useCustomizationRequest(id: string | null) {
  return useQuery({
    queryKey: keys.detail(id ?? ''),
    queryFn: () => getCustomizationRequest(id as string),
    enabled: !!id,
  });
}

export function useRefreshCustomizationRequests() {
  const queryClient = useQueryClient();
  const isRefreshing = useIsFetching({ queryKey: keys.all }) > 0;
  return {
    refreshRequests: () => queryClient.invalidateQueries({ queryKey: keys.all }),
    isRefreshing,
  };
}

/**
 * Applies a patch to every cached copy of one request — the detail query and
 * whichever list pages hold it — so an optimistic edit is visible wherever the
 * reviewer is looking, not just in the sheet they made it from.
 */
function useOptimisticPatch() {
  const queryClient = useQueryClient();

  return async (id: string, patch: Partial<CustomizationRequest>) => {
    await queryClient.cancelQueries({ queryKey: keys.all });
    const previous = queryClient.getQueriesData({ queryKey: keys.all });

    queryClient.setQueryData<CustomizationRequest>(keys.detail(id), (current) =>
      current ? { ...current, ...patch } : current,
    );
    queryClient.setQueriesData<RequestPages>(
      { queryKey: [...keys.all, 'list'] },
      (current) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page) =>
                page.map((request) =>
                  request.id === id ? { ...request, ...patch } : request,
                ),
              ),
            }
          : current,
    );

    return previous;
  };
}

type CachedSnapshot = [readonly unknown[], unknown][];

function useMutationCallbacks(fallbackMessage: string) {
  const queryClient = useQueryClient();
  return {
    onError: (error: unknown, _variables: unknown, context?: CachedSnapshot) => {
      context?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(extractErrorMessage(error, fallbackMessage));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  };
}

export function useUpdateCustomizationRequestStatus() {
  const patchCaches = useOptimisticPatch();
  const callbacks = useMutationCallbacks('Failed to update the request');

  return useMutation({
    mutationFn: ({
      id,
      status,
      internalNote,
    }: {
      id: string;
      status: ReviewableStatus;
      internalNote?: string;
    }) => updateCustomizationRequestStatus(id, status, internalNote),
    onMutate: ({ id, status, internalNote }) =>
      patchCaches(id, {
        status,
        ...(internalNote !== undefined ? { internalNote } : {}),
      }),
    onSuccess: () => toast.success('Request updated'),
    ...callbacks,
  });
}

export function useUpdateCustomizationRequestNote() {
  const patchCaches = useOptimisticPatch();
  const callbacks = useMutationCallbacks('Failed to save the note');

  return useMutation({
    mutationFn: ({ id, internalNote }: { id: string; internalNote: string }) =>
      updateCustomizationRequestNote(id, internalNote),
    onMutate: ({ id, internalNote }) => patchCaches(id, { internalNote }),
    onSuccess: () => toast.success('Note saved'),
    ...callbacks,
  });
}

export function useAssignCustomizationRequest() {
  const patchCaches = useOptimisticPatch();
  const callbacks = useMutationCallbacks('Failed to assign the request');

  return useMutation({
    mutationFn: ({
      id,
      assignedToUserId,
    }: {
      id: string;
      assignedToUserId: string | null;
    }) => assignCustomizationRequest(id, assignedToUserId),
    onMutate: ({ id, assignedToUserId }) => patchCaches(id, { assignedToUserId }),
    ...callbacks,
  });
}

export function useDeleteCustomizationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomizationRequest(id),
    onSuccess: () => {
      toast.success('Request deleted');
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, 'Failed to delete the request')),
  });
}
