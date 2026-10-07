import { isBuiltInSize, type Product } from "../types";

/** Category names compare loosely, and a product with none is "Uncategorized". */
export const toCategoryKey = (category?: string): string =>
  category?.trim().toLowerCase() || "uncategorized";

/** Joins size lists without blanks or case-only twins, first spelling kept. */
export function mergeSizeLists(
  ...sizeLists: readonly (readonly string[])[]
): string[] {
  const seen = new Set<string>();
  return sizeLists.flat().flatMap((rawSize) => {
    const size = rawSize.trim();
    if (!size || seen.has(size.toLowerCase())) return [];
    seen.add(size.toLowerCase());
    return [size];
  });
}

/** The seller's own sizes already used in this category — on a product or any of its variants. */
export function getCustomSizesInCategory(
  products: readonly Product[],
  category?: string,
): string[] {
  const categoryKey = toCategoryKey(category);
  const usedSizes = products
    .filter((product) => toCategoryKey(product.cat) === categoryKey)
    .flatMap((product) => [
      ...(product.sizes ?? []),
      ...(product.variants ?? []).flatMap((variant) => variant.sizes),
    ]);
  return mergeSizeLists(usedSizes).filter((size) => !isBuiltInSize(size));
}
