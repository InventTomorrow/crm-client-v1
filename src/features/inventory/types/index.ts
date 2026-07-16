export type { Product } from "@/lib/mockData";
import { z } from "zod";

export const CATEGORIES = [
  "Apparel",
  "Footwear",
  "Kitchen",
  "Accessories",
  "Beauty",
  "Electronics",
  "Food",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Food has no stock count — just an in-stock/active toggle — and no size/color/gender. */
export function isFoodCategory(category?: string): boolean {
  return category?.trim().toLowerCase() === "food";
}

export type InventoryView = "grid" | "list";

const numericField = z
  .union([z.string(), z.number()])
  .transform((v) =>
    typeof v === "string" ? (v === "" ? 0 : parseFloat(v)) : v,
  );

export const GENDERS = ["Men", "Women", "Kids"] as const;

export const DIETARY_TAGS = ["Veg", "Non-Veg", "Halal", "Vegan"] as const;

/** Starter menu sections for the creatable Food "type" picker. */
export const FOOD_TYPES = [
  "Pizza",
  "Burger",
  "Wings",
  "Fried Chicken",
  "Wraps",
  "Fries",
  "Pasta",
  "Steaks",
  "Sides",
  "Drinks",
  "Add-ons",
  "Deals",
  "Desserts",
] as const;

/** Starter cuisines for the creatable cuisine picker — users can add their own. */
export const CUISINES = [
  "Desi",
  "Pakistani",
  "Indian",
  "Chinese",
  "Thai",
  "Italian",
  "Continental",
  "Arabian",
  "Fast Food",
  "BBQ",
  "Seafood",
  "Mexican",
  "Desserts",
  "Beverages",
] as const;

/** Grouped size options for the product form's size selector. Values stay unique across groups. */
export const SIZE_GROUPS = [
  { label: "Clothing", options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] },
  {
    label: "Footwear (EU)",
    options: [
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "EU 45",
    ],
  },
  { label: "General", options: ["One Size", "Free Size"] },
] as const;

/** Returns the size groups relevant to a category. Apparel → clothing, Footwear → shoe sizes, everything else → general. */
export function getSizeGroupsForCategory(
  category?: string,
): (typeof SIZE_GROUPS)[number][] {
  const c = category?.trim().toLowerCase();
  if (c === "apparel") return SIZE_GROUPS.filter((g) => g.label === "Clothing");
  if (c === "footwear")
    return SIZE_GROUPS.filter((g) => g.label === "Footwear (EU)");
  return SIZE_GROUPS.filter((g) => g.label === "General");
}

/** A single food menu variant (size/portion) with its own absolute price. */
export const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Required"),
  price: numericField.pipe(z.number().positive("Must be > 0")),
  discountPercentage: numericField
    .pipe(z.number().min(0, "≥ 0").max(100, "≤ 100"))
    .optional(),
  available: z.boolean().default(true),
  variantSku: z.string().optional(),
});
export type VariantFormData = z.infer<typeof variantSchema>;

export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().optional(),
    price: numericField.pipe(z.number().min(0, "Price must be ≥ 0")).default(0),
    discountPercentage: numericField
      .pipe(
        z
          .number()
          .min(0, "Discount must be ≥ 0")
          .max(100, "Discount must be ≤ 100"),
      )
      .optional(),
    stock: numericField.pipe(z.number().min(0, "Stock must be ≥ 0")).default(0),
    inStock: z.boolean().default(true),
    cat: z.string().default("Apparel"),
    sizes: z.array(z.string()).default([]),
    gender: z.string().optional(),
    color: z.string().optional(),
    cuisine: z.string().optional(),
    dietaryTag: z.array(z.string()).default([]),
    type: z.string().optional(),
    subType: z.string().optional(),
    variants: z.array(variantSchema).default([]),
    desc: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (isFoodCategory(data.cat)) {
      // Food is priced per variant — require at least one.
      if (!data.variants || data.variants.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["variants"],
          message: "Add at least one size / variant with a price",
        });
      }
    } else if (!data.price || data.price <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Price must be positive",
      });
    }
  });

export type ProductFormData = z.infer<typeof productSchema>;
/** Raw form-input shape (before Zod coercion) — used to type the RHF control. */
export type ProductFormInput = z.input<typeof productSchema>;

/** A row in the bulk-add/import review list, before it's saved as a product. */
export interface BulkItem extends ProductFormData {
  imageUrl?: string;
  imageUrls?: string[];
}

/**
 * Category field registry — the scalable extension point for per-category
 * fields. Add a category's config here and the form/save logic adapt without
 * touching component internals. `default` covers any category not listed.
 */
export interface CategoryFieldConfig {
  /** Priced per-variant (Food) rather than a single base price. */
  usesVariants: boolean;
  /** Hide the internal stock count (Food tracks availability per variant). */
  hidesStock: boolean;
  /** Which detail fields this category shows. */
  detailFields: Array<
    "cuisine" | "dietaryTag" | "type" | "subType" | "gender" | "color" | "sizes"
  >;
}

const FOOD_FIELD_CONFIG: CategoryFieldConfig = {
  usesVariants: true,
  hidesStock: true,
  detailFields: ["cuisine", "dietaryTag", "type", "subType"],
};

const DEFAULT_FIELD_CONFIG: CategoryFieldConfig = {
  usesVariants: false,
  hidesStock: false,
  detailFields: ["gender", "color", "sizes"],
};

const CATEGORY_FIELD_CONFIG: Record<string, CategoryFieldConfig> = {
  food: FOOD_FIELD_CONFIG,
};

/** Resolves the field config for a category (case-insensitive), with a default. */
export function getCategoryFieldConfig(category?: string): CategoryFieldConfig {
  const key = category?.trim().toLowerCase();
  return (key && CATEGORY_FIELD_CONFIG[key]) || DEFAULT_FIELD_CONFIG;
}

export const TIERS = [
  {
    id: 1,
    name: "Manual Catalog",
    desc: "Add products one-by-one. Best for small sellers starting out.",
    cta: "Add Product",
    count: "6 active",
  },
  {
    id: 2,
    name: "URL Sync",
    desc: "Paste a product page URL — we extract details automatically.",
    cta: "Add URL",
    count: "12 synced",
  },
  {
    id: 3,
    name: "Storefront API",
    desc: "Connect Shopify, Daraz, WooCommerce. Live two-way sync.",
    cta: "Connect Store",
    count: "Shopify ✓",
  },
  {
    id: 4,
    name: "ERP Integration",
    desc: "Enterprise: connect SAP, Oracle, Odoo. Real-time inventory.",
    cta: "Configure",
    count: "Beta",
  },
] as const;

export const STOREFRONTS = [
  {
    name: "Shopify",
    status: "connected",
    color: "#96BF48",
    acct: "saleflow.myshopify.com",
  },
  {
    name: "Daraz",
    status: "connected",
    color: "#F85606",
    acct: "saleflow.daraz.pk",
  },
  { name: "WooCommerce", status: "disconnected", color: "#7F54B3", acct: "—" },
  { name: "BigCommerce", status: "disconnected", color: "#34313F", acct: "—" },
] as const;

export const ERP_SYSTEMS = ["SAP S/4HANA", "Oracle NetSuite", "Odoo"] as const;
