// src/features/inventory/services/productsService.ts
import { apiClient } from "@/lib/apiClient";
import type { Product, ProductVariant } from "@/lib/mockData";

// ─── Types ────────────────────────────────────────────────

interface ApiProductVariant {
  id: string;
  name: string;
  value: string | null;
  size: string | null;
  sizes?: string[] | null;
  color: string | null;
  sku: string | null;
  imageUrl: string | null;
  priceDelta: number | null;
  stock: number | null;
}

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
  customOptionsEnabled?: boolean;
  customOptionKeys?: string[];
  customOptionNote?: string | null;
  variants?: ApiProductVariant[];
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
  customOptionsEnabled?: boolean;
  customOptionKeys?: string[];
  customOptionNote?: string;
  variants?: VariantPayload[];
}

/** A variant as the API stores it — priced as an offset from the product's price. */
export interface VariantPayload {
  id?: string;
  name: string;
  sizes: string[];
  color?: string;
  sku?: string;
  imageUrl?: string;
  priceDelta: number;
  stock: number;
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
  customOptionsEnabled?: boolean;
  customOptionKeys?: string[];
  customOptionNote?: string;
  variants?: VariantPayload[];
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
}

// ─── Mapper ───────────────────────────────────────────────

// Older option rows ("Size" / "XL") open as a version labelled by their value, so editing converts them.
function mapVariant(
  variant: ApiProductVariant,
  productPrice: number,
): ProductVariant {
  const legacyValue = variant.value?.trim();
  const legacySize =
    variant.size ??
    (legacyValue && /size/i.test(variant.name) ? legacyValue : undefined);
  return {
    id: variant.id,
    name: legacyValue || variant.name,
    sizes: variant.sizes?.length ? variant.sizes : legacySize ? [legacySize] : [],
    color:
      variant.color ??
      (legacyValue && /colou?r/i.test(variant.name) ? legacyValue : undefined),
    sku: variant.sku ?? undefined,
    imageUrl: variant.imageUrl ?? undefined,
    price: productPrice + (variant.priceDelta ?? 0),
    stock: variant.stock ?? 0,
  };
}

function mapProduct(p: ApiProduct): Product {
  const stock = p.stock ?? 0;
  const status: Product["status"] =
    stock === 0 ? "out" : stock <= 12 ? "low" : "in";
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? "",
    price: p.price,
    discountPercentage: p.discountPercentage ?? undefined,
    stock,
    status,
    cat: p.category ?? "Uncategorized",
    size: p.size ?? "",
    sizes: p.sizes ?? [],
    gender: p.gender ?? "",
    color: p.color ?? "",
    desc: p.description ?? "",
    imageUrls: p.imageUrls ?? [],
    // Defaulted: a server that predates these fields must still render.
    customOptionsEnabled: p.customOptionsEnabled ?? false,
    customOptionKeys: p.customOptionKeys ?? [],
    customOptionNote: p.customOptionNote ?? "",
    variants: (p.variants ?? []).map((variant) => mapVariant(variant, p.price)),
  };
}

// ─── Service functions ─────────────────────────────────────

export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ApiProduct[];
  }>("/products");
  return (data.data ?? []).map(mapProduct);
};

export const createProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  const { data } = await apiClient.post<{ success: boolean; data: ApiProduct }>(
    "/products",
    payload,
  );
  return mapProduct(data.data);
};

export const updateProduct = async (
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const { data } = await apiClient.put<{ success: boolean; data: ApiProduct }>(
    `/products/${id}`,
    payload,
  );
  return mapProduct(data.data);
};

export const deleteProduct = async (id: string): Promise<{ id: string }> => {
  await apiClient.delete(`/products/${id}`);
  return { id };
};

export const duplicateProduct = async (product: Product): Promise<Product> => {
  const { data } = await apiClient.post<{ success: boolean; data: ApiProduct }>(
    `/products/${product.id}/duplicate`,
  );
  return mapProduct(data.data);
};

export const bulkCreateProducts = async (
  products: CreateProductPayload[],
): Promise<Product[]> => {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ApiProduct[];
  }>("/products/bulk", { products });
  return (data.data ?? []).map(mapProduct);
};

export type UploadFolder =
  | "products"
  | "menu"
  | "avatars"
  | "attachments"
  | "resources"
  | "receipts";

/** Step 1: get a presigned PUT URL from our backend */
export const getPresignedUrl = async (
  fileName: string,
  mimeType: string,
  folder: UploadFolder = "products",
): Promise<PresignedUrlResult> => {
  const { data } = await apiClient.post<{
    success: boolean;
    data: PresignedUrlResult;
  }>("/upload/presign", { fileName, mimeType, folder });
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
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else
        reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("S3 upload failed: network error"));
    xhr.send(file);
  });
};

/**
 * Deletes an uploaded object from S3.
 *
 * Only for files this session uploaded and then discarded — a photo swapped out
 * or a form abandoned before saving. Images belonging to a saved product are
 * cleaned up server-side when the product is updated or deleted.
 */
export const deleteUploadedFile = async (url: string): Promise<void> => {
  await apiClient.delete("/upload", { data: { url } });
};

/**
 * Full presigned upload flow:
 * 1. Get presigned URL from server
 * 2. PUT the file directly to S3
 * 3. Return the public CDN URL
 */
export const presignedUpload = async (
  file: File,
  folder: UploadFolder = "products",
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const { uploadUrl, publicUrl } = await getPresignedUrl(
    file.name,
    file.type,
    folder,
  );
  await uploadToS3(uploadUrl, file, onProgress);
  return publicUrl;
};
