'use client';
import { extractErrorMessage } from '@/lib/utils';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createResource,
  deleteResource,
  getResources,
  updateResource,
} from '../services/resourcesService';
import type { ResourceFilters, ResourceFormData } from '../types';

const PAGE_SIZE = 20;

const resourceKeys = {
  all: ['resources'] as const,
  list: (filters: ResourceFilters) => ['resources', 'list', filters] as const,
};

export function useResourcesQuery(filters: ResourceFilters) {
  return useInfiniteQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getResources({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

function useInvalidateResources() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: resourceKeys.all });
}

export function useCreateResource() {
  const invalidateResources = useInvalidateResources();
  return useMutation({
    mutationFn: (payload: ResourceFormData) => createResource(payload),
    onSuccess: () => {
      invalidateResources();
      toast.success('Resource added');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to add resource')),
  });
}

export function useUpdateResource() {
  const invalidateResources = useInvalidateResources();
  return useMutation({
    mutationFn: ({
      resourceId,
      payload,
    }: {
      resourceId: string;
      payload: Partial<ResourceFormData>;
    }) => updateResource(resourceId, payload),
    onSuccess: () => {
      invalidateResources();
      toast.success('Resource updated');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update resource')),
  });
}

export function useDeleteResource() {
  const invalidateResources = useInvalidateResources();
  return useMutation({
    mutationFn: (resourceId: string) => deleteResource(resourceId),
    onSuccess: () => {
      invalidateResources();
      toast.success('Resource deleted');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete resource')),
  });
}
