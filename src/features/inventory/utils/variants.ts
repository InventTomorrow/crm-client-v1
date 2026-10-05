import { pkr } from "@/lib/utils";

type VariantAmounts = { price?: unknown; stock?: unknown } | undefined;
type VariantSkuParts = { sku?: string; color?: string; size?: string } | undefined;

export interface VariantTotals {
  variantCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  totalStock: number;
  soldOutCount: number;
}

/** A blank field is "not typed yet", never zero — so a half-filled row doesn't read as sold out. */
const toTypedNumber = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

export function getVariantTotals(variants: readonly VariantAmounts[]): VariantTotals {
  const prices = variants
    .map((variant) => toTypedNumber(variant?.price))
    .filter((price): price is number => price !== null && price > 0);
  const stocks = variants
    .map((variant) => toTypedNumber(variant?.stock))
    .filter((stock): stock is number => stock !== null);

  return {
    variantCount: variants.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    totalStock: stocks.reduce((sum, stock) => sum + Math.max(0, stock), 0),
    soldOutCount: stocks.filter((stock) => stock <= 0).length,
  };
}

export function formatPriceRange(minPrice: number | null, maxPrice: number | null): string {
  if (minPrice === null || maxPrice === null) return "—";
  return minPrice === maxPrice ? pkr(minPrice) : `${pkr(minPrice)} – ${pkr(maxPrice)}`;
}

const toSkuSegment = (value: string | undefined): string =>
  (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * The SKU a blank variant is saved with: product SKU + colour + size ("BS-006-RED-XL").
 * Typed SKUs are kept as-is, and a repeat gets "-2", "-3" so no two variants share one.
 */
export function getSuggestedVariantSkus(
  productSku: string | undefined,
  variants: readonly VariantSkuParts[],
): (string | undefined)[] {
  const base = toSkuSegment(productSku);
  if (!base) return variants.map(() => undefined);

  const taken = new Set(
    variants.flatMap((variant) => {
      const typedSku = variant?.sku?.trim().toUpperCase();
      return typedSku ? [typedSku] : [];
    }),
  );

  return variants.map((variant, index) => {
    if (variant?.sku?.trim()) return undefined;
    const attributes = [toSkuSegment(variant?.color), toSkuSegment(variant?.size)].filter(Boolean);
    const stem = [base, ...(attributes.length ? attributes : [String(index + 1)])].join("-");
    let candidate = stem;
    for (let copy = 2; taken.has(candidate); copy++) candidate = `${stem}-${copy}`;
    taken.add(candidate);
    return candidate;
  });
}

export function describeVariantStock(variantCount: number, soldOutCount: number): string {
  const across = `Across ${variantCount} variant${variantCount === 1 ? "" : "s"}`;
  return soldOutCount ? `${across} · ${soldOutCount} sold out` : across;
}
