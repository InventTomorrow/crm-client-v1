'use client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  updateMenuItem,
  type CreateMenuItemPayload,
  type UpdateMenuItemPayload,
} from '../services/menuService';
import type { MenuItemFilters } from '../types';

const PAGE_SIZE = 25;

const menuItemKeys = {
  all: ['menu-items'] as const,
  list: (filters: MenuItemFilters) => ['menu-items', 'list', filters] as const,
  detail: (menuItemId: string) => ['menu-items', 'detail', menuItemId] as const,
};

function invalidateMenuItems(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
}

export function useMenuItems(filters: MenuItemFilters, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: menuItemKeys.list(filters),
    queryFn: ({ pageParam }) => getMenuItems({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1]?.id : undefined,
    enabled: options?.enabled,
  });
}

export function useMenuItem(menuItemId: string | undefined) {
  return useQuery({
    queryKey: menuItemKeys.detail(menuItemId ?? ''),
    queryFn: () => getMenuItem(menuItemId as string),
    enabled: !!menuItemId,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMenuItemPayload) => createMenuItem(payload),
    onSuccess: () => {
      toast.success('Menu item added');
      invalidateMenuItems(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to add menu item')),
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuItemId, payload }: { menuItemId: string; payload: UpdateMenuItemPayload }) =>
      updateMenuItem(menuItemId, payload),
    onSuccess: () => {
      toast.success('Menu item updated');
      invalidateMenuItems(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update menu item')),
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (menuItemId: string) => deleteMenuItem(menuItemId),
    onSuccess: () => {
      toast.success('Menu item deleted');
      invalidateMenuItems(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete menu item')),
  });
}
