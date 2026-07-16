import type { CreateProductPayload } from "../services/productsService";
import { isFoodCategory, type ProductFormData } from "../types";

/**
 * Maps validated form data to the API payload. Food is priced per variant, so
 * its base price is derived from the cheapest variant and stock/availability
 * come from the variants rather than the (hidden) base fields.
 */
export function buildProductPayload(
  data: ProductFormData & { imageUrls: string[] },
): CreateProductPayload {
  const isFood = isFoodCategory(data.cat);

  const variants = (data.variants ?? []).map((v) => ({
    label: v.label,
    price: Number(v.price) || 0,
    discountPercentage:
      v.discountPercentage == null ? undefined : Number(v.discountPercentage),
    available: v.available ?? true,
    variantSku: v.variantSku || undefined,
  }));

  const foodBasePrice = variants.length
    ? Math.min(...variants.map((v) => v.price))
    : 0;

  return {
    name: data.name,
    sku: data.sku || undefined,
    price: isFood ? foodBasePrice : Number(data.price) || 0,
    discountPercentage: isFood ? undefined : data.discountPercentage,
    stock: isFood ? 0 : Number(data.stock) || 0,
    inStock: isFood ? variants.some((v) => v.available) : data.inStock,
    cuisine: data.cuisine || undefined,
    dietaryTag: data.dietaryTag?.length ? data.dietaryTag : undefined,
    type: data.type || undefined,
    subType: data.subType || undefined,
    description: data.desc || undefined,
    category: data.cat || undefined,
    sizes: isFood ? [] : (data.sizes ?? []),
    gender: isFood ? undefined : data.gender || undefined,
    color: isFood ? undefined : data.color || undefined,
    imageUrls: data.imageUrls,
    variants: isFood ? variants : undefined,
  };
}
