import { z } from 'zod';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  ingredients: string[];
  allergens: string[];
  isAvailable: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const numericField = z
  .union([z.string(), z.number()])
  .transform((value) => (typeof value === 'string' ? (value === '' ? 0 : parseFloat(value)) : value));

export const menuItemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: numericField.pipe(z.number().positive('Price must be positive')),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

export interface MenuItemFilters {
  search?: string;
  category?: string;
  isAvailable?: boolean;
}
