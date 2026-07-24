'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/appStore';
import type { Product } from '@/lib/mockData';
import { extractErrorMessage } from '@/lib/utils';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  bulkCreateProducts,
  getPresignedUrl,
  uploadToS3,
  type CreateProductPayload,
  type UpdateProductPayload,
  type UploadFolder,
} from '../services/productsService';

export type UploadPhase = 'idle' | 'requesting-url' | 'uploading';

/** Shared query key scoped to the active workspace */
function useProductsKey() {
  const workspaceId = useAppStore((s) => s.currentWorkspaceId);
  return ['products', workspaceId] as const;
}

export function useProducts() {
  const queryKey = useProductsKey();
  const workspaceId = useAppStore((s) => s.currentWorkspaceId);
  return useQuery({
    queryKey,
    queryFn: fetchProducts,
    enabled: !!workspaceId,
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  const queryKey = useProductsKey();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Product added');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const queryKey = useProductsKey();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Product[]>(queryKey) ?? [];
      queryClient.setQueryData(
        queryKey,
        previous.map((p) => (p.id === id ? { ...p, ...data } : p)),
      );
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error(extractErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const queryKey = useProductsKey();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Product[]>(queryKey) ?? [];
      queryClient.setQueryData(queryKey, previous.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error(extractErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();
  const queryKey = useProductsKey();
  return useMutation({
    mutationFn: (product: Product) => duplicateProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Product duplicated');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useBulkAddProducts() {
  const queryClient = useQueryClient();
  const queryKey = useProductsKey();
  return useMutation({
    mutationFn: (products: CreateProductPayload[]) => bulkCreateProducts(products),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${data.length} product${data.length !== 1 ? 's' : ''} saved`);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/**
 * Returns a function that uploads a File to S3 via a presigned PUT URL
 * and resolves to the public URL string. `progress` tracks the live upload
 * percentage (0-100) of the in-flight upload, if any. `phase` distinguishes
 * "waiting on the presigned URL" from "actively uploading to S3", so callers
 * can show a phase-specific loading state instead of a single generic spinner.
 */
export function usePresignedUpload(folder: UploadFolder = 'products') {
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setPhase('requesting-url');
      const { uploadUrl, publicUrl } = await getPresignedUrl(file.name, file.type, folder);
      setPhase('uploading');
      await uploadToS3(uploadUrl, file, setProgress);
      return publicUrl;
    },
    onError: (error) => toast.error(`Image upload failed: ${extractErrorMessage(error)}`),
    onSettled: () => {
      setProgress(null);
      setPhase('idle');
    },
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    progress,
    phase,
  };
}
