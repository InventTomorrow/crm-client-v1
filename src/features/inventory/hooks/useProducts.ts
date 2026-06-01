'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  presignedUpload,
  type CreateProductPayload,
  type UpdateProductPayload,
  type UploadFolder,
} from '../services/productsService';

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
 * and resolves to the public URL string.
 */
export function usePresignedUpload(folder: UploadFolder = 'products') {
  const mutation = useMutation({
    mutationFn: (file: File) => presignedUpload(file, folder),
    onError: (error) => toast.error(`Image upload failed: ${extractErrorMessage(error)}`),
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
