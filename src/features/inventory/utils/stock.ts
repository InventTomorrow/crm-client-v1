import { isFoodCategory } from "../types";
import type { Product } from "../types";

/** Derives a stock badge status. Food items have no count — the inStock
 * toggle decides in/out directly, with no "low" state. */
export function stockStatus(
  stock: number,
  category?: string,
  inStock?: boolean,
): Product["status"] {
  if (isFoodCategory(category)) return inStock === false ? "out" : "in";
  if (stock === 0) return "out";
  if (stock <= 12) return "low";
  return "in";
}

export const STOCK_LABEL: Record<Product["status"], string> = {
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
};
