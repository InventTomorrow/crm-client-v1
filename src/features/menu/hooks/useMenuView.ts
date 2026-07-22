'use client';
import { useCallback, useMemo, useState } from 'react';
import { useUrlState } from '@/shared/hooks/useUrlState';
import { useCreateMenuItem, useDeleteMenuItem, useMenuItems, useUpdateMenuItem } from './useMenuItems';
import type { MenuItem, MenuItemFormData } from '../types';

/** Owns all Menu tab state, derived data, and mutation wiring so the view component stays a thin render layer. */
export function useMenuView() {
  const [search, setSearch] = useUrlState('q');
  const [filterCategory, setFilterCategory] = useUrlState('cat');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const filters = useMemo(
    () => ({ search: search || undefined, category: filterCategory || undefined }),
    [search, filterCategory],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMenuItems(filters);
  const menuItems = useMemo(() => data?.pages.flat() ?? [], [data]);

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const item of menuItems) {
      const key = item.category.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      options.push(item.category);
    }
    return options;
  }, [menuItems]);

  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const isSaving = createMenuItem.isPending || updateMenuItem.isPending;

  const openAddDialog = useCallback(() => {
    setEditingItem(null);
    setFormDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setFormDialogOpen(true);
  }, []);

  const closeFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setEditingItem(null);
  }, []);

  const handleSave = useCallback(
    (formData: MenuItemFormData) => {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        price: formData.price,
        ingredients: formData.ingredients,
        allergens: formData.allergens,
        isAvailable: formData.isAvailable,
        imageUrl: formData.imageUrl || undefined,
      };
      if (editingItem) {
        updateMenuItem.mutate(
          { menuItemId: editingItem.id, payload },
          { onSuccess: closeFormDialog },
        );
      } else {
        createMenuItem.mutate(payload, { onSuccess: closeFormDialog });
      }
    },
    [editingItem, updateMenuItem, createMenuItem, closeFormDialog],
  );

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
    filterCategory,
    setFilterCategory,
    categoryOptions,
    formDialogOpen,
    editingItem,
    openAddDialog,
    openEditDialog,
    closeFormDialog,
    handleSave,
    isSaving,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isDeleting: deleteMenuItem.isPending,
  };
}
