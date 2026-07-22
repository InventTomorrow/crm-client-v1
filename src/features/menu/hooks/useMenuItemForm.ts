import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { MenuItem } from '../types';
import { menuItemFormSchema, type MenuItemFormData } from '../types';

const INITIAL_FORM_VALUES = {
  name: '',
  category: '',
  description: '',
  price: 0,
  ingredients: [],
  allergens: [],
  isAvailable: true,
  imageUrl: '',
} satisfies z.input<typeof menuItemFormSchema>;

/** Splits a comma-separated string into trimmed, non-empty entries. */
function parseCommaList(text: string): string[] {
  return text
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Owns the menu item dialog's form state, image field, and the comma-separated
 * ingredients/allergens inputs. Reset whenever the dialog opens with a different
 * (or no) initial item. */
export function useMenuItemForm(open: boolean, initial?: MenuItem | null) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredientsText, setIngredientsText] = useState('');
  const [allergensText, setAllergensText] = useState('');

  const form = useForm<z.input<typeof menuItemFormSchema>, unknown, MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: INITIAL_FORM_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    setImageUrl(initial?.imageUrl ?? null);
    setIngredientsText(initial?.ingredients?.join(', ') ?? '');
    setAllergensText(initial?.allergens?.join(', ') ?? '');
    form.reset(
      initial
        ? {
            name: initial.name,
            category: initial.category,
            description: initial.description ?? '',
            price: initial.price,
            ingredients: initial.ingredients,
            allergens: initial.allergens,
            isAvailable: initial.isAvailable,
            imageUrl: initial.imageUrl ?? '',
          }
        : INITIAL_FORM_VALUES,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  /** Merges the comma-separated ingredient/allergen text into the submitted form data. */
  function buildSubmitData(data: MenuItemFormData): MenuItemFormData {
    return {
      ...data,
      ingredients: parseCommaList(ingredientsText),
      allergens: parseCommaList(allergensText),
    };
  }

  return {
    form,
    imageUrl,
    setImageUrl,
    ingredientsText,
    setIngredientsText,
    allergensText,
    setAllergensText,
    buildSubmitData,
  };
}
