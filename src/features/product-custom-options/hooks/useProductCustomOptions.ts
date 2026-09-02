"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCustomOption,
  deleteCustomOption,
  getCustomOptions,
  getCustomOptionUsage,
  updateCustomOption,
  type UpdateCustomOptionPayload,
} from "../services/productCustomOptionsService";
import type { CustomOptionFormData, ProductCustomOption } from "../types";

export const customOptionKeys = {
  all: ["product-custom-options"] as const,
  usage: (optionId: string) =>
    ["product-custom-options", "usage", optionId] as const,
};

/**
 * The workspace's whole option pool. Small and shared by every product form,
 * so it is fetched once and cached rather than paged.
 */
export function useProductCustomOptions() {
  return useQuery({
    queryKey: customOptionKeys.all,
    queryFn: getCustomOptions,
    staleTime: 5 * 60 * 1000,
  });
}

/** Deferred until the delete is actually being considered. */
export function useCustomOptionUsage(optionId: string | undefined) {
  return useQuery({
    queryKey: customOptionKeys.usage(optionId ?? ""),
    queryFn: () => getCustomOptionUsage(optionId!),
    enabled: Boolean(optionId),
  });
}

export function useCreateCustomOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomOptionFormData) => createCustomOption(payload),
    // No optimistic insert: the server derives the key, and a row invented here
    // would carry a fake one that the product's checkbox then writes down.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customOptionKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateCustomOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      optionId,
      payload,
    }: {
      optionId: string;
      payload: UpdateCustomOptionPayload;
    }) => updateCustomOption(optionId, payload),

    onMutate: async ({ optionId, payload }) => {
      await queryClient.cancelQueries({ queryKey: customOptionKeys.all });
      const previousOptions = queryClient.getQueryData<ProductCustomOption[]>(
        customOptionKeys.all,
      );

      queryClient.setQueryData<ProductCustomOption[]>(
        customOptionKeys.all,
        (options) =>
          options?.map((option) =>
            option.id === optionId ? { ...option, ...payload } : option,
          ),
      );

      return { previousOptions };
    },

    onError: (error, _variables, context) => {
      if (context?.previousOptions) {
        queryClient.setQueryData(customOptionKeys.all, context.previousOptions);
      }
      toast.error(extractErrorMessage(error));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: customOptionKeys.all });
    },
  });
}

export function useDeleteCustomOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionId: string) => deleteCustomOption(optionId),

    onMutate: async (optionId) => {
      await queryClient.cancelQueries({ queryKey: customOptionKeys.all });
      const previousOptions = queryClient.getQueryData<ProductCustomOption[]>(
        customOptionKeys.all,
      );

      queryClient.setQueryData<ProductCustomOption[]>(
        customOptionKeys.all,
        (options) => options?.filter((option) => option.id !== optionId),
      );

      return { previousOptions };
    },

    onError: (error, _optionId, context) => {
      if (context?.previousOptions) {
        queryClient.setQueryData(customOptionKeys.all, context.previousOptions);
      }
      toast.error(extractErrorMessage(error));
    },

    onSuccess: () => {
      toast.success("Option removed");
      // Deleting unhooks the key from every product that offered it.
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: customOptionKeys.all });
    },
  });
}
