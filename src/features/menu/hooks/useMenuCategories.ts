'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  createMenuCategory,
  deleteMenuCategory,
  getMenuCategories,
  updateMenuCategory,
  type CreateMenuCategoryPayload,
  type UpdateMenuCategoryPayload,
} from '../services/menuService';

const menuCategoryKeys = {
  all: ['menu-categories'] as const,
};

export function useMenuCategories() {
  return useQuery({
    queryKey: menuCategoryKeys.all,
    queryFn: getMenuCategories,
  });
}

export function useCreateMenuCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMenuCategoryPayload) => createMenuCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create category')),
  });
}

export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateMenuCategoryPayload;
    }) => updateMenuCategory(categoryId, payload),
    onSuccess: () => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update category')),
  });
}

export function useDeleteMenuCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deleteMenuCategory(categoryId),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete category')),
  });
}
