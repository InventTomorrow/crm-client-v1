import { z } from 'zod';

// Mirrors the server's Prisma ServingSize enum.
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

/**
 * A photo of the physical menu card. Purely presentational — customers browse
 * these, then order by name and the assistant resolves that name against the
 * real MenuItem records. Never a source of prices or availability.
 */
export interface MenuCard {
  id: string;
  imageUrl: string;
  title?: string | null;
  sortOrder: number;
  isActive: boolean;
}

// Mirrors the server's createMenuCardSchema.
export const menuCardFormSchema = z.object({
  imageUrl: z.string().url('A menu card image is required'),
  title: z.string().max(120).optional(),
  isActive: z.boolean().default(true),
});
export type MenuCardFormData = z.infer<typeof menuCardFormSchema>;

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
