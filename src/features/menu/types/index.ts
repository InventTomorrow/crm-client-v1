import { z } from 'zod';

export interface MenuCategory {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuTag {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface MenuItemVariant {
  name: string;
  price: number;
  isDefault: boolean;
  imageUrl?: string | null;
}

export interface MenuItemAddon {
  name: string;
  price: number;
  isRequired: boolean;
  maxSelect: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  category: MenuCategory;
  name: string;
  description?: string | null;
  basePrice: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime?: number | null;
  calories?: number | null;
  sortOrder: number;
  variants: MenuItemVariant[];
  addons: MenuItemAddon[];
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

const numericField = z
  .union([z.string(), z.number()])
  .transform((value) => (typeof value === 'string' ? (value === '' ? 0 : parseFloat(value)) : value));

const menuItemVariantFormSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  price: numericField.pipe(z.number().positive('Price must be positive')),
  isDefault: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const menuItemAddonFormSchema = z.object({
  name: z.string().min(1, 'Addon name is required'),
  price: numericField.pipe(z.number().nonnegative('Price cannot be negative')),
  isRequired: z.boolean().default(false),
  maxSelect: numericField.pipe(z.number().int().min(1)).default(1),
});

export const menuItemFormSchema = z
  .object({
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    // Positivity is enforced conditionally below: variants own price validation
    // once they exist, since basePrice just mirrors the default variant then.
    basePrice: numericField.pipe(z.number().nonnegative('Price must be positive')),
    imageUrl: z.string().url().optional().or(z.literal('')),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    preparationTime: numericField.pipe(z.number().int().positive()).optional(),
    calories: numericField.pipe(z.number().int().positive()).optional(),
    variants: z.array(menuItemVariantFormSchema).default([]),
    addons: z.array(menuItemAddonFormSchema).default([]),
    tagIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    // No variants → basePrice is the real price field, must be positive.
    // With variants → each variant's own price is already validated positive
    // by menuItemVariantFormSchema; basePrice just mirrors the default one.
    if (data.variants.length === 0 && !(data.basePrice > 0)) {
      ctx.addIssue({
        path: ['basePrice'],
        code: z.ZodIssueCode.custom,
        message: 'Price must be positive',
      });
    }
  });

export type MenuItemFormData = z.infer<typeof menuItemFormSchema>;
/** Pre-transform shape (numeric fields still accept string input) — what react-hook-form's `useForm` generic is actually keyed on. */
export type MenuItemFormInput = z.input<typeof menuItemFormSchema>;

export interface MenuItemFilters {
  search?: string;
  categoryId?: string;
  tagId?: string;
  isAvailable?: boolean;
}
