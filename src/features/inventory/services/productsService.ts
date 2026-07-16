// src/features/inventory/services/productsService.ts
import { apiClient } from '@/lib/apiClient';
import type { FoodVariant, Product } from '@/lib/mockData';
import { stockStatus } from '../utils/stock';

// ─── Types ────────────────────────────────────────────────

interface ApiVariant {
  id: string;
  label: string | null;
  price: number | null;
  discountPercentage: number | null;
  available: boolean | null;
  variantSku: string | null;
  // legacy generic fields (ignored by the food UI)
  value?: string | null;
}

interface ApiProduct {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  inStock: boolean | null;
  cuisine: string | null;
  dietaryTag: string[];
  type: string | null;
  subType: string | null;
  description: string | null;
  category: string | null;
  size: string | null;
  sizes: string[] | null;
  gender: string | null;
  color: string | null;
  imageUrls: string[];
  variants?: ApiVariant[];
  tenantId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Variant payload sent when creating/updating a product. */
export interface ProductVariantPayload {
  id?: string;
  label: string;
  price: number;
  discountPercentage?: number;
  available: boolean;
  variantSku?: string;
}

export interface CreateProductPayload {
  name: string;
  sku?: string;
  price: number;
  stock: number;
  inStock?: boolean;
  cuisine?: string;
  dietaryTag?: string[];
  type?: string;
  subType?: string;
  description?: string;
  category?: string;
  size?: string;
  sizes?: string[];
  gender?: string;
  color?: string;
  imageUrls?: string[];
  variants?: ProductVariantPayload[];
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  inStock?: boolean;
  cuisine?: string;
  dietaryTag?: string[];
  type?: string;
  subType?: string;
  description?: string;
  category?: string;
  size?: string;
  sizes?: string[];
  gender?: string;
  color?: string;
  imageUrls?: string[];
  variants?: ProductVariantPayload[];
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
}

// ─── Mapper ───────────────────────────────────────────────

function mapVariant(v: ApiVariant): FoodVariant {
  return {
    id: v.id,
    label: v.label ?? v.value ?? '',
    price: v.price ?? 0,
    discountPercentage: v.discountPercentage ?? undefined,
    available: v.available ?? true,
    variantSku: v.variantSku ?? undefined,
  };
}

function mapProduct(p: ApiProduct): Product {
  const stock = p.stock ?? 0;
  const status = stockStatus(stock, p.category ?? undefined, p.inStock ?? undefined);
  // Only surface food variants (those carrying a label) to the UI.
  const variants = (p.variants ?? [])
    .filter((v) => v.label != null || v.price != null)
    .map(mapVariant);
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    price: p.price,
    stock,
    inStock: p.inStock ?? undefined,
    status,
    cat: p.category ?? 'Uncategorized',
    size: p.size ?? '',
    sizes: p.sizes ?? [],
    gender: p.gender ?? '',
    color: p.color ?? '',
    cuisine: p.cuisine ?? undefined,
    dietaryTag: p.dietaryTag ?? [],
    type: p.type ?? undefined,
    subType: p.subType ?? undefined,
    variants: variants.length ? variants : undefined,
    desc: p.description ?? '',
    imageUrls: p.imageUrls ?? [],
  };
}

// ─── Service functions ─────────────────────────────────────

export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: ApiProduct[] }>('/products');
  return (data.data ?? []).map(mapProduct);
};

export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const { data } = await apiClient.post<{ success: boolean; data: ApiProduct }>('/products', payload);
  return mapProduct(data.data);
};

export const updateProduct = async (
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const { data } = await apiClient.put<{ success: boolean; data: ApiProduct }>(`/products/${id}`, payload);
  return mapProduct(data.data);
};

export const deleteProduct = async (id: string): Promise<{ id: string }> => {
  await apiClient.delete(`/products/${id}`);
  return { id };
};

export const duplicateProduct = async (product: Product): Promise<Product> => {
  const payload: CreateProductPayload = {
    name: `${product.name} (copy)`,
    sku: product.sku ? `${product.sku}-copy` : undefined,
    price: product.price,
    stock: product.stock,
    inStock: product.inStock,
    cuisine: product.cuisine || undefined,
    dietaryTag: product.dietaryTag?.length ? product.dietaryTag : undefined,
    type: product.type || undefined,
    subType: product.subType || undefined,
    description: product.desc,
    category: product.cat || undefined,
    size: product.size || undefined,
    sizes: product.sizes ?? [],
    gender: product.gender || undefined,
    color: product.color || undefined,
    imageUrls: product.imageUrls ?? [],
    variants: product.variants?.map((v) => ({
      label: v.label,
      price: v.price,
      discountPercentage: v.discountPercentage,
      available: v.available,
      variantSku: v.variantSku,
    })),
  };
  return createProduct(payload);
};

export const bulkCreateProducts = async (products: CreateProductPayload[]): Promise<Product[]> => {
  const { data } = await apiClient.post<{ success: boolean; data: ApiProduct[] }>('/products/bulk', { products });
  return (data.data ?? []).map(mapProduct);
};

export type UploadFolder = 'products' | 'avatars' | 'attachments';

/** Step 1: get a presigned PUT URL from our backend */
export const getPresignedUrl = async (
  fileName: string,
  mimeType: string,
  folder: UploadFolder = 'products',
): Promise<PresignedUrlResult> => {
  const { data } = await apiClient.post<{ success: boolean; data: PresignedUrlResult }>(
    '/upload/presign',
    { fileName, mimeType, folder },
  );
  return data.data;
};

/** Step 2: PUT the file directly to S3 using the presigned URL */
export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`);
  }
};

/**
 * Full presigned upload flow:
 * 1. Get presigned URL from server
 * 2. PUT the file directly to S3
 * 3. Return the public CDN URL
 */
export const presignedUpload = async (file: File, folder: UploadFolder = 'products'): Promise<string> => {
  const { uploadUrl, publicUrl } = await getPresignedUrl(file.name, file.type, folder);
  await uploadToS3(uploadUrl, file);
  return publicUrl;
};
