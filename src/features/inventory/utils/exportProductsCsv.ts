import type { Product } from "../types";
import { STOCK_LABEL, stockStatus } from "./stock";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/**
 * Exports products to CSV. Columns round-trip back through the importer
 * (rowToBulkItem) — multi-value cells (sizes, image_urls) are pipe-joined so
 * re-import restores them.
 */
export function exportProductsCsv(rows: Product[], filename?: string): void {
  const headers = [
    "Name",
    "SKU",
    "Category",
    "Gender",
    "Color",
    "Price",
    "DiscountPercentage",
    "Stock",
    "Status",
    "Sizes",
    "Description",
    "ImageUrls",
  ];
  const lines = [headers.join(",")];
  for (const p of rows) {
    lines.push(
      [
        p.name,
        p.sku,
        p.cat,
        p.gender ?? "",
        p.color ?? "",
        p.price,
        p.discountPercentage ?? "",
        p.stock,
        STOCK_LABEL[stockStatus(p.stock, p.cat, p.inStock)],
        (p.sizes ?? []).join("|"),
        p.desc ?? "",
        (p.imageUrls ?? []).join("|"),
      ]
        .map(esc)
        .join(","),
    );
  }
  const csv = lines.join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename?.trim() || `inventory_export_${new Date().toISOString().split("T")[0]}`}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
