'use client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  createServiceOffering,
  deleteServiceOffering,
  getServiceOffering,
  getServiceOfferings,
  updateServiceOffering,
  updateServicePlans,
  type CreateServiceOfferingPayload,
  type UpdateServiceOfferingPayload,
} from '../services/servicesService';
import type { ServiceOfferingFilters, ServicePlan } from '../types';

const PAGE_SIZE = 25;

const serviceKeys = {
  all: ['services'] as const,
  list: (filters: ServiceOfferingFilters) => ['services', 'list', filters] as const,
  detail: (serviceId: string) => ['services', 'detail', serviceId] as const,
};

function invalidateServices(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: serviceKeys.all });
}

export function useServiceOfferings(
  filters: ServiceOfferingFilters,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getServiceOfferings({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1]?.id : undefined,
    enabled: options?.enabled,
  });
}

export function useServiceOffering(serviceId: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.detail(serviceId ?? ''),
    queryFn: () => getServiceOffering(serviceId as string),
    enabled: !!serviceId,
  });
}

export function useCreateServiceOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceOfferingPayload) => createServiceOffering(payload),
    onSuccess: () => {
      toast.success('Service offering added');
      invalidateServices(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to add service')),
  });
}

export function useUpdateServiceOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: string;
      payload: UpdateServiceOfferingPayload;
    }) => updateServiceOffering(serviceId, payload),
    onSuccess: () => {
      toast.success('Service offering updated');
      invalidateServices(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update service')),
  });
}

export function useUpdateServicePlans() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, plans }: { serviceId: string; plans: ServicePlan[] }) =>
      updateServicePlans(serviceId, plans),
    onSuccess: () => {
      toast.success('Plans updated');
      invalidateServices(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update plans')),
  });
}

export function useDeleteServiceOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => deleteServiceOffering(serviceId),
    onSuccess: () => {
      toast.success('Service offering deleted');
      invalidateServices(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete service')),
  });
}

/** Distinct categories already in use, for the category autocomplete. Reads one wide page rather
 * than adding an endpoint — the catalog is small and this keeps suggestions to real values. */
export function useServiceCategories() {
  return useQuery({
    queryKey: ['services', 'categories'] as const,
    queryFn: async () => {
      const services = await getServiceOfferings({ limit: 100 });
      const categories = services
        .map((service) => service.category?.trim())
        .filter((category): category is string => !!category);
      return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
    },
    staleTime: 5 * 60 * 1000,
  });
}
