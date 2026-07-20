import type { Product } from "../types";

/** Derives a stock badge status from a raw stock count. */
export function stockStatus(stock: number): Product["status"] {
  if (stock === 0) return "out";
  if (stock <= 12) return "low";
  return "in";
}

export const STOCK_LABEL: Record<Product["status"], string> = {
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
};
