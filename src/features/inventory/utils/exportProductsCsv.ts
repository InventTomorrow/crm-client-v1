import type { Product } from "../types";
import { STOCK_LABEL, stockStatus } from "./stock";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const DEFAULT_EXPORT_NAME = () =>
  `inventory_export_${new Date().toISOString().split("T")[0]}`;

/** Downloads a Blob under `${filename}.${extension}`, then revokes the object URL. */
function downloadBlob(blob: Blob, filename: string, extension: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename?.trim() || DEFAULT_EXPORT_NAME()}.${extension}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Row shape shared by both export formats — keys match what the importer
 * (rowToBulkItem via objectToRow) recognises, so an export round-trips back in. */
function buildProductExportRows(rows: Product[]) {
  return rows.map((p) => ({
    Name: p.name,
    SKU: p.sku ?? "",
    Category: p.cat,
    Gender: p.gender ?? "",
    Color: p.color ?? "",
    Price: p.price,
    DiscountPercentage: p.discountPercentage ?? "",
    Stock: p.stock,
    Status: STOCK_LABEL[stockStatus(p.stock, p.cat, p.inStock)],
    Sizes: (p.sizes ?? []).join("|"),
    Description: p.desc ?? "",
    ImageUrls: (p.imageUrls ?? []).join("|"),
  }));
}

const EXPORT_HEADERS = [
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
] as const;

/** Exports products to CSV. Multi-value cells (sizes, image_urls) are
 * pipe-joined so re-import restores them. */
export function exportProductsCsv(rows: Product[], filename?: string): void {
  const lines = [EXPORT_HEADERS.join(",")];
  for (const row of buildProductExportRows(rows)) {
    lines.push(EXPORT_HEADERS.map((h) => esc(row[h])).join(","));
  }
  downloadBlob(
    new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }),
    filename ?? "",
    "csv",
  );
}

/** Exports products to JSON — the same round-trippable rows as the CSV export. */
export function exportProductsJson(rows: Product[], filename?: string): void {
  const json = JSON.stringify(buildProductExportRows(rows), null, 2);
  downloadBlob(
    new Blob([json], { type: "application/json;charset=utf-8;" }),
    filename ?? "",
    "json",
  );
}
