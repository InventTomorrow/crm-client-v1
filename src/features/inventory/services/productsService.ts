// src/features/inventory/services/productsService.ts
import { apiClient } from '@/lib/apiClient';
import type { Product } from '@/lib/mockData';

// ─── Types ────────────────────────────────────────────────

interface ApiProduct {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  discountPercentage: number | null;
  stock: number;
  description: string | null;
  category: string | null;
  size: string | null;
  sizes: string[] | null;
  gender: string | null;
  color: string | null;
  imageUrls: string[];
  variants?: unknown[];
  tenantId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  sku?: string;
  price: number;
  discountPercentage?: number;
  stock: number;
  description?: string;
  category?: string;
  size?: string;
  sizes?: string[];
  gender?: string;
  color?: string;
  imageUrls?: string[];
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  price?: number;
  discountPercentage?: number;
  stock?: number;
  description?: string;
  category?: string;
  size?: string;
  sizes?: string[];
  gender?: string;
  color?: string;
  imageUrls?: string[];
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
}

// ─── Mapper ───────────────────────────────────────────────

function mapProduct(p: ApiProduct): Product {
  const stock = p.stock ?? 0;
  const status: Product['status'] = stock === 0 ? 'out' : stock <= 12 ? 'low' : 'in';
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    price: p.price,
    discountPercentage: p.discountPercentage ?? undefined,
    stock,
    status,
    cat: p.category ?? 'Uncategorized',
    size: p.size ?? '',
    sizes: p.sizes ?? [],
    gender: p.gender ?? '',
    color: p.color ?? '',
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
    discountPercentage: product.discountPercentage,
    stock: product.stock,
    description: product.desc,
    category: product.cat || undefined,
    size: product.size || undefined,
    sizes: product.sizes ?? [],
    gender: product.gender || undefined,
    color: product.color || undefined,
    imageUrls: product.imageUrls ?? [],
  };
  return createProduct(payload);
};

export const bulkCreateProducts = async (products: CreateProductPayload[]): Promise<Product[]> => {
  const { data } = await apiClient.post<{ success: boolean; data: ApiProduct[] }>('/products/bulk', { products });
  return (data.data ?? []).map(mapProduct);
};

export type UploadFolder = 'products' | 'menu' | 'avatars' | 'attachments';

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

/**
 * Step 2: PUT the file directly to S3 using the presigned URL.
 * Uses XMLHttpRequest rather than fetch — fetch has no cross-browser upload
 * progress event, XHR's `upload.onprogress` does.
 */
export const uploadToS3 = (
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error('S3 upload failed: network error'));
    xhr.send(file);
  });
};

/**
 * Full presigned upload flow:
 * 1. Get presigned URL from server
 * 2. PUT the file directly to S3
 * 3. Return the public CDN URL
 */
export const presignedUpload = async (
  file: File,
  folder: UploadFolder = 'products',
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const { uploadUrl, publicUrl } = await getPresignedUrl(file.name, file.type, folder);
  await uploadToS3(uploadUrl, file, onProgress);
  return publicUrl;
};
