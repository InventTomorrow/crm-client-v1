export type { Product } from "@/lib/mockData";
import { z } from "zod";

export const CATEGORIES = [
  "Apparel",
  "Footwear",
  "Kitchen",
  "Accessories",
  "Beauty",
  "Electronics",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type InventoryView = "grid" | "list";

const numericField = z
  .union([z.string(), z.number(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return undefined as unknown as number;
    if (typeof v === "string") return v === "" ? undefined as unknown as number : parseFloat(v);
    return v;
  });

export const GENDERS = ["Men", "Women", "Kids"] as const;

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

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  price: numericField.pipe(z.number().positive("Price must be positive")),
  discountPercentage: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((v) => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = typeof v === "string" ? parseFloat(v) : v;
      return isNaN(n) ? undefined : n;
    })
    .pipe(
      z
        .number()
        .min(0, "Discount must be ≥ 0")
        .max(100, "Discount must be ≤ 100")
        .optional(),
    )
    .optional(),
  stock: numericField.pipe(z.number().min(0, "Stock must be ≥ 0")),
  cat: z.string().default("Apparel"),
  sizes: z.array(z.string()).default([]),
  gender: z.string().optional(),
  color: z.string().optional(),
  desc: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

/** A product row inside the bulk-add dialog (form data + image references). */
export interface BulkItem extends ProductFormData {
  /** Primary image shown in the card / editor. */
  imageUrl?: string;
  /** Full set of images (kept from imports that carry several URLs). */
  imageUrls?: string[];
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
    acct: "asaanrabta.myshopify.com",
  },
  {
    name: "Daraz",
    status: "connected",
    color: "#F85606",
    acct: "asaanrabta.daraz.pk",
  },
  { name: "WooCommerce", status: "disconnected", color: "#7F54B3", acct: "—" },
  { name: "BigCommerce", status: "disconnected", color: "#34313F", acct: "—" },
] as const;

export const ERP_SYSTEMS = ["SAP S/4HANA", "Oracle NetSuite", "Odoo"] as const;
