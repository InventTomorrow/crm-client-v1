import { parseCsv } from "@/lib/csv";
import type { BulkItem } from "../components/BulkAddDialog";

/** Reads the first matching key from a row, tolerating spaces/underscores in headers. */
function pick(o: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k] ?? o[k.replace(/[\s_]/g, "")] ?? o[k.replace(/\s+/g, "_")];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

/** Splits a delimited multi-value cell (images, sizes) on | ; , or newlines. */
function splitList(raw: string): string[] {
  return raw
    .split(/[|;\n]+|,(?=\s*https?:)|,(?=\s*[A-Za-z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseImages(o: Record<string, string>): string[] {
  const raw = pick(
    o,
    "imageurls",
    "image_urls",
    "images",
    "image_url",
    "imageurl",
    "image",
    "img",
    "photo",
    "picture",
  );
  return raw ? splitList(raw) : [];
}

function parseSizes(o: Record<string, string>): string[] {
  const raw = pick(o, "sizes", "size");
  return raw ? splitList(raw) : [];
}

function toNumber(raw: string): number {
  const n = Number(raw.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Maps a single parsed CSV/JSON row (keys already lowercased) to a BulkItem. */
export function rowToBulkItem(o: Record<string, string>): BulkItem {
  const images = parseImages(o);
  const discountRaw = pick(
    o,
    "discountpercentage",
    "discount_percentage",
    "discount",
    "discount%",
  );
  return {
    name: pick(o, "name", "product", "product_name", "title"),
    sku: pick(o, "sku", "code"),
    price: toNumber(pick(o, "price", "unit_price", "rate")),
    discountPercentage: discountRaw ? toNumber(discountRaw) : undefined,
    stock: toNumber(pick(o, "stock", "quantity", "qty", "inventory")),
    inStock: true,
    cat: pick(o, "category", "cat") || "Apparel",
    sizes: parseSizes(o),
    gender: pick(o, "gender"),
    color: pick(o, "color", "colour"),
    cuisine: pick(o, "cuisine"),
    dietaryTag: pick(o, "dietarytag", "dietary_tag", "dietary", "diet")
      .split(/[,|]+/)
      .map((s) => s.trim())
      .filter(Boolean),
    type: pick(o, "type", "menusection", "section"),
    subType: pick(o, "subtype", "sub_type"),
    variants: [],
    desc: pick(o, "description", "desc", "details"),
    imageUrl: images[0] ?? "",
    imageUrls: images,
  };
}

/** Flattens an arbitrary object into a string-keyed, lowercased row for the mapper. */
export function objectToRow(
  p: Record<string, unknown>,
): Record<string, string> {
  const row: Record<string, string> = {};
  for (const [k, v] of Object.entries(p)) {
    row[k.toLowerCase()] = Array.isArray(v)
      ? v.join("|")
      : v == null
        ? ""
        : String(v);
  }
  return row;
}

export function parseProductsCsv(text: string): BulkItem[] {
  return parseCsv(text)
    .map(rowToBulkItem)
    .filter((p) => p.name);
}

export function parseProductsJson(text: string): BulkItem[] {
  const j = JSON.parse(text);
  const arr: Record<string, unknown>[] = Array.isArray(j)
    ? j
    : (j.products ?? []);
  return arr.map((p) => rowToBulkItem(objectToRow(p))).filter((p) => p.name);
}
