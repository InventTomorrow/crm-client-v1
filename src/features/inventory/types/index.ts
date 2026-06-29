export type { Product } from '@/lib/mockData';
import { z } from 'zod';

export const CATEGORIES = ['Apparel', 'Footwear', 'Kitchen', 'Accessories', 'Beauty', 'Electronics'] as const;
export type Category = typeof CATEGORIES[number];

export type InventoryView = 'grid' | 'list';

const numericField = z.union([z.string(), z.number()]).transform(v =>
  typeof v === 'string' ? (v === '' ? 0 : parseFloat(v)) : v
);

export const GENDERS = ['Unisex', 'Men', 'Women', 'Kids'] as const;

export const productSchema = z.object({
  name:   z.string().min(1, 'Product name is required'),
  sku:    z.string().optional(),
  price:  numericField.pipe(z.number().positive('Price must be positive')),
  stock:  numericField.pipe(z.number().min(0, 'Stock must be ≥ 0')),
  cat:    z.string().default('Apparel'),
  size:   z.string().optional(),
  gender: z.string().optional(),
  color:  z.string().optional(),
  desc:   z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const TIERS = [
  { id: 1, name: 'Manual Catalog',  desc: 'Add products one-by-one. Best for small sellers starting out.', cta: 'Add Product', count: '6 active' },
  { id: 2, name: 'URL Sync',        desc: 'Paste a product page URL — we extract details automatically.',  cta: 'Add URL',     count: '12 synced' },
  { id: 3, name: 'Storefront API',  desc: 'Connect Shopify, Daraz, WooCommerce. Live two-way sync.',       cta: 'Connect Store', count: 'Shopify ✓' },
  { id: 4, name: 'ERP Integration', desc: 'Enterprise: connect SAP, Oracle, Odoo. Real-time inventory.',   cta: 'Configure',   count: 'Beta' },
] as const;

export const STOREFRONTS = [
  { name: 'Shopify',     status: 'connected',    color: '#96BF48', acct: 'saleflow.myshopify.com' },
  { name: 'Daraz',       status: 'connected',    color: '#F85606', acct: 'saleflow.daraz.pk' },
  { name: 'WooCommerce', status: 'disconnected', color: '#7F54B3', acct: '—' },
  { name: 'BigCommerce', status: 'disconnected', color: '#34313F', acct: '—' },
] as const;

export const ERP_SYSTEMS = ['SAP S/4HANA', 'Oracle NetSuite', 'Odoo'] as const;
