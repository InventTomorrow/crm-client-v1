'use client';
import { useCallback, useState } from 'react';
import {
  useCreateMenuCategory,
  useDeleteMenuCategory,
  useMenuCategories,
  useUpdateMenuCategory,
} from './useMenuCategories';
import type { MenuCategory } from '../types';

export interface MenuCategoryDraft {
  name: string;
  description: string;
  imageUrl: string;
}

const EMPTY_DRAFT: MenuCategoryDraft = { name: '', description: '', imageUrl: '' };

/** Owns all Menu Categories page state and mutation wiring so the view stays a thin render layer. */
export function useMenuCategoriesView() {
  const { data: categories = [], isLoading } = useMenuCategories();
  const createCategory = useCreateMenuCategory();
  const updateCategory = useUpdateMenuCategory();
  const deleteCategory = useDeleteMenuCategory();

  const [draft, setDraft] = useState<MenuCategoryDraft>(EMPTY_DRAFT);
  const [categoryBeingEdited, setCategoryBeingEdited] = useState<MenuCategory | null>(null);
  const [categoryPendingDeletion, setCategoryPendingDeletion] = useState<MenuCategory | null>(null);

  const startEditing = useCallback((category: MenuCategory) => {
    setCategoryBeingEdited(category);
    setDraft({
      name: category.name,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setCategoryBeingEdited(null);
    setDraft(EMPTY_DRAFT);
  }, []);

  const submitDraft = useCallback(() => {
    const name = draft.name.trim();
    if (!name) return;
    const payload = {
      name,
      description: draft.description.trim() || undefined,
      imageUrl: draft.imageUrl.trim() || undefined,
    };

    if (categoryBeingEdited) {
      updateCategory.mutate(
        { categoryId: categoryBeingEdited.id, payload },
        { onSuccess: cancelEditing },
      );
      return;
    }
    createCategory.mutate(payload, { onSuccess: () => setDraft(EMPTY_DRAFT) });
  }, [draft, categoryBeingEdited, updateCategory, createCategory, cancelEditing]);

  const confirmDelete = useCallback(() => {
    if (!categoryPendingDeletion) return;
    deleteCategory.mutate(categoryPendingDeletion.id);
    if (categoryBeingEdited?.id === categoryPendingDeletion.id) cancelEditing();
    setCategoryPendingDeletion(null);
  }, [categoryPendingDeletion, deleteCategory, categoryBeingEdited, cancelEditing]);

  return {
    categories,
    isLoading,
    draft,
    setDraft,
    categoryBeingEdited,
    startEditing,
    cancelEditing,
    submitDraft,
    isSaving: createCategory.isPending || updateCategory.isPending,
    categoryPendingDeletion,
    setCategoryPendingDeletion,
    confirmDelete,
    isDeleting: deleteCategory.isPending,
  };
}
