"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  revokeApiKey,
  sendTestExternalOrder,
} from "../services/apiKey.service";
import type { ApiKey, CreateApiKeyDto, ExternalOrderTestResult } from "../types";

const API_KEYS_QUERY_KEY = ["api-keys"];

export function useApiKeysQuery() {
  return useQuery({ queryKey: API_KEYS_QUERY_KEY, queryFn: listApiKeys });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) => createApiKey(dto),
    onSuccess: (created) => {
      queryClient.setQueryData<ApiKey[]>(API_KEYS_QUERY_KEY, (old = []) => [
        created,
        ...old,
      ]);
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to create API key")),
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: API_KEYS_QUERY_KEY });
      const prev = queryClient.getQueryData<ApiKey[]>(API_KEYS_QUERY_KEY);
      queryClient.setQueryData<ApiKey[]>(API_KEYS_QUERY_KEY, (old = []) =>
        old.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k)),
      );
      return { prev };
    },
    onError: (error, _id, ctx) => {
      toast.error(extractErrorMessage(error, "Failed to revoke API key"));
      if (ctx?.prev) queryClient.setQueryData(API_KEYS_QUERY_KEY, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY }),
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: API_KEYS_QUERY_KEY });
      const prev = queryClient.getQueryData<ApiKey[]>(API_KEYS_QUERY_KEY);
      queryClient.setQueryData<ApiKey[]>(API_KEYS_QUERY_KEY, (old = []) =>
        old.filter((k) => k.id !== id),
      );
      return { prev };
    },
    onError: (error, _id, ctx) => {
      toast.error(extractErrorMessage(error, "Failed to delete API key"));
      if (ctx?.prev) queryClient.setQueryData(API_KEYS_QUERY_KEY, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY }),
  });
}

export function useSendTestExternalOrder() {
  return useMutation<ExternalOrderTestResult, unknown, { key: string; payload: unknown }>({
    mutationFn: ({ key, payload }) => sendTestExternalOrder(key, payload),
  });
}
