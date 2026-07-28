'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { MenuItem } from '../types';
import { menuItemFormSchema, type MenuItemFormData } from '../types';
import { useCreateMenuItem, useMenuItem, useUpdateMenuItem } from './useMenuItems';

const INITIAL_FORM_VALUES = {
  categoryId: '',
  name: '',
  description: '',
  basePrice: 0,
  imageUrl: '',
  isAvailable: true,
  isFeatured: false,
  variants: [],
  addons: [],
  tagIds: [],
} satisfies z.input<typeof menuItemFormSchema>;

function toFormValues(item: MenuItem): z.input<typeof menuItemFormSchema> {
  return {
    categoryId: item.categoryId,
    name: item.name,
    description: item.description ?? '',
    basePrice: item.basePrice,
    imageUrl: item.imageUrl ?? '',
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    preparationTime: item.preparationTime ?? undefined,
    calories: item.calories ?? undefined,
    variants: item.variants.map((variant) => ({ ...variant, imageUrl: variant.imageUrl ?? '' })),
    addons: item.addons,
    tagIds: item.tagIds,
    broadCategory: item.broadCategory ?? undefined,
    servingSize: item.servingSize ?? undefined,
  };
}

/** Owns the menu item form page: fetches the item in edit mode, wires react-hook-form
 * with variant/addon field arrays, and submits via create or update depending on mode. */
export function useMenuItemForm(menuItemId?: string) {
  const router = useRouter();
  const isEditMode = !!menuItemId;
  const { data: existingItem, isLoading: isLoadingItem } = useMenuItem(menuItemId);

  const form = useForm<z.input<typeof menuItemFormSchema>, unknown, MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: INITIAL_FORM_VALUES,
  });

  useEffect(() => {
    if (existingItem) form.reset(toFormValues(existingItem));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingItem]);

  const variantFields = useFieldArray({ control: form.control, name: 'variants' });
  const addonFields = useFieldArray({ control: form.control, name: 'addons' });

  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const isSaving = createMenuItem.isPending || updateMenuItem.isPending;

  const handleSubmit = form.handleSubmit((data) => {
    const payload = {
      categoryId: data.categoryId,
      name: data.name,
      description: data.description || undefined,
      basePrice: data.basePrice,
      imageUrl: data.imageUrl || undefined,
      isAvailable: data.isAvailable,
      isFeatured: data.isFeatured,
      preparationTime: data.preparationTime,
      calories: data.calories,
      variants: data.variants.map((variant) => ({
        ...variant,
        imageUrl: variant.imageUrl || undefined,
      })),
      addons: data.addons,
      tagIds: data.tagIds,
      broadCategory: data.broadCategory,
      servingSize: data.servingSize,
    };
    if (isEditMode && menuItemId) {
      updateMenuItem.mutate({ menuItemId, payload }, { onSuccess: () => router.push('/menu') });
    } else {
      createMenuItem.mutate(payload, { onSuccess: () => router.push('/menu') });
    }
  });

  return {
    form,
    isEditMode,
    isLoadingItem,
    variantFields,
    addonFields,
    isSaving,
    handleSubmit,
  };
}
