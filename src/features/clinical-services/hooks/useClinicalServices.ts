"use client";
import { extractErrorMessage } from "@/lib/utils";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createClinicalService,
  deleteClinicalService,
  getClinicalService,
  getClinicalServicePreview,
  getClinicalServices,
  updateClinicalService,
  type CreateClinicalServicePayload,
  type UpdateClinicalServicePayload,
} from "../services/clinicalServicesService";
import type { ClinicalServiceFilters } from "../types";

export const CLINICAL_SERVICES_PAGE_SIZE = 10;

const clinicalServiceKeys = {
  all: ["clinical-services"] as const,
  list: (filters: ClinicalServiceFilters) =>
    ["clinical-services", "list", filters] as const,
  paged: (filters: ClinicalServiceFilters) =>
    ["clinical-services", "paged", filters] as const,
  detail: (serviceId: string) =>
    ["clinical-services", "detail", serviceId] as const,
  preview: (serviceId: string) =>
    ["clinical-services", "preview", serviceId] as const,
};

function invalidateClinicalServices(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: clinicalServiceKeys.all });
  // Coverage rows and the grid are keyed off the service list.
  queryClient.invalidateQueries({ queryKey: ["clinic-coverage"] });
}

/**
 * One wide page, for callers that need the whole active catalogue as a lookup
 * (the coverage grid). The listing screen uses the cursor-paged hook below.
 */
export function useClinicalServices(
  filters: ClinicalServiceFilters = {},
  /** Held back where the caller only needs the catalogue once something is open. */
  options?: { enabled?: boolean },
) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryKey: clinicalServiceKeys.list(filters),
    queryFn: () => getClinicalServices({ ...filters, limit: 100 }),
  });
}

/**
 * The listing screen's source. The endpoint returns a bare array, so a full page
 * is the signal that another cursor exists — a short page means the end.
 */
export function useInfiniteClinicalServices(
  filters: ClinicalServiceFilters = {},
) {
  return useInfiniteQuery({
    queryKey: clinicalServiceKeys.paged(filters),
    queryFn: ({ pageParam }) =>
      getClinicalServices({
        ...filters,
        cursor: pageParam,
        limit: CLINICAL_SERVICES_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === CLINICAL_SERVICES_PAGE_SIZE
        ? lastPage[lastPage.length - 1]?.id
        : undefined,
  });
}

/**
 * The categories already in use, so the form suggests existing spellings rather
 * than letting "Nursing" and "nursing " become two categories. Derived from the
 * list rather than a dedicated endpoint — same approach as the agency catalogue.
 */
export function useClinicalServiceCategories() {
  return useQuery({
    queryKey: [...clinicalServiceKeys.all, "categories"] as const,
    queryFn: async () => {
      const services = await getClinicalServices({ limit: 100 });
      const categories = services
        .map((service) => service.category?.trim())
        .filter((category): category is string => Boolean(category));
      return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useClinicalService(serviceId: string | undefined) {
  return useQuery({
    queryKey: clinicalServiceKeys.detail(serviceId ?? ""),
    queryFn: () => getClinicalService(serviceId!),
    enabled: Boolean(serviceId),
  });
}

/** The assistant-facing rendering of one service, for the preview panel. */
export function useClinicalServicePreview(serviceId: string | undefined) {
  return useQuery({
    queryKey: clinicalServiceKeys.preview(serviceId ?? ""),
    queryFn: () => getClinicalServicePreview(serviceId!),
    enabled: Boolean(serviceId),
  });
}

export function useCreateClinicalService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClinicalServicePayload) =>
      createClinicalService(payload),
    onSuccess: () => {
      toast.success("Service added");
      invalidateClinicalServices(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateClinicalService(serviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClinicalServicePayload) =>
      updateClinicalService(serviceId, payload),
    onSuccess: () => {
      toast.success("Service updated");
      invalidateClinicalServices(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/**
 * Creates the row behind step one of the wizard. Silent on success: the record
 * exists but is still a draft, so "Service added" would be a lie.
 */
export function useCreateClinicalServiceDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClinicalServicePayload) =>
      createClinicalService(payload),
    onError: (error) => toast.error(extractErrorMessage(error)),
    onSettled: () => invalidateClinicalServices(queryClient),
  });
}

/**
 * The wizard's per-step save. Silent on success — a toast at every step would
 * be noise — and the caller advances before this settles, so a failure has to
 * announce itself and send the admin back to the step that did not save.
 */
export function useSaveClinicalServiceStep(serviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClinicalServicePayload) =>
      updateClinicalService(serviceId, payload),
    onError: (error) => toast.error(extractErrorMessage(error)),
    onSettled: () => invalidateClinicalServices(queryClient),
  });
}

export function useDeleteClinicalService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => deleteClinicalService(serviceId),
    onSuccess: () => {
      toast.success("Service removed");
      invalidateClinicalServices(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
