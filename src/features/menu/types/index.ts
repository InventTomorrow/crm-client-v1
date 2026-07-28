import { z } from 'zod';

// Mirrors the server's Prisma BroadCategory / ServingSize enums.
export const BROAD_CATEGORIES = [
  'FAST_FOOD',
  'FRIED_CHICKEN',
  'BBQ_GRILL',
  'DESI',
  'CHINESE',
  'PIZZA',
  'SEAFOOD',
  'BREAKFAST',
  'DESSERTS',
  'DRINKS',
] as const;
export type BroadCategory = (typeof BROAD_CATEGORIES)[number];

export const BROAD_CATEGORY_LABELS: Record<BroadCategory, string> = {
  FAST_FOOD: 'Fast Food',
  FRIED_CHICKEN: 'Fried Chicken',
  BBQ_GRILL: 'BBQ & Grill',
  DESI: 'Desi',
  CHINESE: 'Chinese',
  PIZZA: 'Pizza',
  SEAFOOD: 'Seafood',
  BREAKFAST: 'Breakfast',
  DESSERTS: 'Desserts',
  DRINKS: 'Drinks',
};

export const SERVING_SIZES = ['SOLO', 'SMALL_GROUP', 'FAMILY'] as const;
export type ServingSize = (typeof SERVING_SIZES)[number];

export const SERVING_SIZE_LABELS: Record<ServingSize, string> = {
  SOLO: 'Solo (1 person)',
  SMALL_GROUP: 'Small group (2-3)',
  FAMILY: 'Family (4+)',
};

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
  servingSize?: ServingSize | null;
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
  broadCategory?: BroadCategory | null;
  servingSize?: ServingSize | null;
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
  servingSize: z.enum(SERVING_SIZES).optional(),
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
    broadCategory: z.enum(BROAD_CATEGORIES).optional(),
    servingSize: z.enum(SERVING_SIZES).optional(),
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
