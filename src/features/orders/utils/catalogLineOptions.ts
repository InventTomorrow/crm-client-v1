import { getVariantLabel, type Product } from "@/features/inventory/types";
import { orderSizes } from "@/features/inventory/utils/variants";

/** One pickable order line: a product without variants, or one variant of a product. */
export interface CatalogLineOption {
  optionId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  sku?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  coverImageUrl?: string;
  sizes: string[];
  searchText: string;
}

export interface CatalogLineIndex {
  byOptionId: Map<string, CatalogLineOption>;
  byProductId: Map<string, CatalogLineOption[]>;
}

/** How a saved or picked order line lines up with today's catalog. */
export interface LineCatalogMatch {
  /** Set only on an exact product/variant match — it drives the size picker and the selected chip. */
  option?: CatalogLineOption;
  highlightedOptionIds: string[];
  imageUrl?: string;
}

type CatalogLineRef = {
  productId?: string;
  variantId?: string;
  name?: string;
  imageUrl?: string;
};

export const getCatalogLineOptionId = (
  productId: string | undefined,
  variantId: string | undefined,
): string | undefined => {
  if (variantId) return `variant:${variantId}`;
  return productId ? `product:${productId}` : undefined;
};

const isSameName = (first: string, second: string): boolean =>
  first.trim().toLowerCase() === second.trim().toLowerCase();

const toSearchText = (parts: (string | undefined)[]): string =>
  parts.filter(Boolean).join(" ");

const getProductSizes = (product: Product): string[] =>
  orderSizes([
    ...new Set(
      [...(product.sizes ?? []), product.size]
        .map((size) => size?.trim())
        .filter((size): size is string => !!size),
    ),
  ]);

// A product with variants is only sold as one of them, so the bare product isn't offered.
export function getCatalogLineOptions(
  products: readonly Product[],
): CatalogLineOption[] {
  return products.flatMap((product): CatalogLineOption[] => {
    const coverImageUrl = product.imageUrls?.[0];
    if (!product.variants?.length) {
      return [
        {
          optionId: `product:${product.id}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku || undefined,
          price: product.price,
          stock: product.stock,
          imageUrl: coverImageUrl,
          coverImageUrl,
          sizes: getProductSizes(product),
          searchText: toSearchText([product.name, product.sku, product.color]),
        },
      ];
    }
    return product.variants.map((variant) => {
      const variantLabel = getVariantLabel(variant, product.name);
      return {
        optionId: `variant:${variant.id}`,
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantLabel: isSameName(variantLabel, product.name)
          ? undefined
          : variantLabel,
        sku: variant.sku || product.sku || undefined,
        price: variant.price,
        stock: variant.stock,
        imageUrl: variant.imageUrl || coverImageUrl,
        coverImageUrl,
        sizes: orderSizes(variant.sizes),
        searchText: toSearchText([
          product.name,
          variantLabel,
          variant.color,
          variant.sku,
          product.sku,
          ...variant.sizes,
        ]),
      };
    });
  });
}

// Matches how the assistant names lines — "Product (Variant / Size)" — so catalog search keeps working on them.
export const getOrderLineName = (
  option: Pick<CatalogLineOption, "productName" | "variantLabel">,
  size: string | undefined,
): string => {
  const selection = [option.variantLabel, size?.trim()].filter(Boolean);
  return selection.length
    ? `${option.productName} (${selection.join(" / ")})`
    : option.productName;
};

export function getCatalogLineIndex(
  options: readonly CatalogLineOption[],
): CatalogLineIndex {
  const byProductId = new Map<string, CatalogLineOption[]>();
  for (const option of options) {
    byProductId.set(option.productId, [...(byProductId.get(option.productId) ?? []), option]);
  }
  return {
    byOptionId: new Map(options.map((option) => [option.optionId, option])),
    byProductId,
  };
}

/** The size a saved line was named with, e.g. "M" from "Linen Shirt (Black / M)". */
export const getLineSizeFromName = (
  option: CatalogLineOption,
  lineName: string,
): string | undefined =>
  option.sizes.find((size) => getOrderLineName(option, size) === lineName);

const isNamedAfter = (option: CatalogLineOption, lineName: string): boolean =>
  getOrderLineName(option, "") === lineName ||
  getLineSizeFromName(option, lineName) !== undefined;

// The assistant sells a size from the product's own list without a variant, so such a line carries only the product id.
export function getLineCatalogMatch(
  line: CatalogLineRef | undefined,
  catalogIndex: CatalogLineIndex,
): LineCatalogMatch {
  const optionId = getCatalogLineOptionId(line?.productId, line?.variantId);
  const option = optionId ? catalogIndex.byOptionId.get(optionId) : undefined;
  if (option) {
    return { option, highlightedOptionIds: [option.optionId], imageUrl: option.imageUrl };
  }

  const productOptions = line?.productId
    ? (catalogIndex.byProductId.get(line.productId) ?? [])
    : [];
  const lineName = line?.name;
  const namedOption = lineName
    ? productOptions.find((productOption) => isNamedAfter(productOption, lineName))
    : undefined;
  return {
    highlightedOptionIds: (namedOption ? [namedOption] : productOptions).map(
      (productOption) => productOption.optionId,
    ),
    imageUrl:
      namedOption?.imageUrl ?? line?.imageUrl ?? productOptions[0]?.coverImageUrl,
  };
}
