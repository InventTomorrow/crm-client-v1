'use client';
import { useCallback, useMemo, useState } from 'react';
import { useUrlState } from '@/shared/hooks/useUrlState';
import { useMenuCategories } from './useMenuCategories';
import { useDeleteMenuItem, useMenuItems } from './useMenuItems';
import type { MenuItem } from '../types';

/** Owns all Menu tab state, derived data, and mutation wiring so the view component stays a thin render layer. */
export function useMenuView() {
  const [search, setSearch] = useUrlState('q');
  const [filterCategoryId, setFilterCategoryId] = useUrlState('cat');
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const filters = useMemo(
    () => ({ search: search || undefined, categoryId: filterCategoryId || undefined }),
    [search, filterCategoryId],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMenuItems(filters);
  const menuItems = useMemo(() => data?.pages.flat() ?? [], [data]);

  const { data: categories = [] } = useMenuCategories();

  const deleteMenuItem = useDeleteMenuItem();

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMenuItem.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMenuItem]);

  return {
    menuItems,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    search,
    setSearch,
    filterCategoryId,
    setFilterCategoryId,
    categories,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isDeleting: deleteMenuItem.isPending,
  };
}
