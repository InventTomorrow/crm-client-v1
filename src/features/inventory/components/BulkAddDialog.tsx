"use client";
import { parseCsv } from "@/lib/csv";
import { extractErrorMessage, getImageUrl, pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/Sheet";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { Form } from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { presignedUpload } from "../services/productsService";
<<<<<<< Updated upstream
import type { ProductFormData } from "../types";
import { CATEGORIES, productSchema } from "../types";
import { SizeSelector } from "./SizeSelector";
=======
import type { BulkItem, ProductFormData, ProductFormInput } from "../types";
import { CATEGORIES, productSchema } from "../types";
import {
  parseProductsCsv,
  parseProductsJson,
} from "../utils/importProductsCsv";
import { ProductFormBody } from "./ProductFormBody";
>>>>>>> Stashed changes

export interface BulkItem extends ProductFormData {
  imageUrl?: string;
}

const EMPTY_ITEM = (): BulkItem => ({
  name: "",
  sku: "",
  price: 0,
  stock: 0,
  inStock: true,
  cat: "Apparel",
  sizes: [],
<<<<<<< Updated upstream
  desc: "",
  imageUrl: "",
});

function parseImageCol(o: Record<string, string>): string {
  return o.image_url ?? o.imageurl ?? o.imageurls ?? o.image ?? o.img ?? "";
}

function parseCSV(text: string): BulkItem[] {
  return parseCsv(text)
    .map((o) => ({
      name: o.name ?? o.product ?? "",
      sku: o.sku ?? "",
      price: Number(o.price) || 0,
      stock: Number(o.stock) || 0,
      cat: o.category ?? o.cat ?? "Apparel",
      sizes: [],
      desc: o.description ?? o.desc ?? "",
      imageUrl: parseImageCol(o),
    }))
    .filter((p) => p.name);
}

function parseJSON(text: string): BulkItem[] {
  const j = JSON.parse(text);
  const arr: any[] = Array.isArray(j) ? j : (j.products ?? []);
  return arr
    .map((p) => ({
      name: p.name ?? "",
      sku: p.sku ?? "",
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      cat: p.category ?? p.cat ?? "Apparel",
      sizes: Array.isArray(p.sizes) ? p.sizes.map(String) : [],
      desc: p.description ?? p.desc ?? "",
      imageUrl: p.imageUrl ?? p.image_url ?? p.image ?? "",
    }))
    .filter((p) => p.name);
=======
  dietaryTag: [],
  gender: "",
  color: "",
  desc: "",
  imageUrl: "",
  imageUrls: [],
  variants: [],
});

/** Seeds the reusable product form from a bulk item row. */
function toFormValues(item: BulkItem): ProductFormInput {
  return {
    name: item.name,
    sku: item.sku ?? "",
    price: item.price ?? 0,
    discountPercentage: item.discountPercentage ?? undefined,
    stock: item.stock ?? 0,
    inStock: item.inStock ?? true,
    cat: item.cat ?? "Apparel",
    sizes: item.sizes ?? [],
    gender: item.gender ?? "",
    color: item.color ?? "",
    cuisine: item.cuisine ?? "",
    dietaryTag: item.dietaryTag ?? [],
    type: item.type ?? "",
    subType: item.subType ?? "",
    variants: item.variants ?? [],
    desc: item.desc ?? "",
  };
>>>>>>> Stashed changes
}

// ── Inline Edit Panel ─────────────────────────────────────
// Reuses the same accordion form as the single-product dialog.
function EditPanel({
  item,
  onSave,
  onDelete,
}: {
  item: BulkItem;
  onSave: (p: BulkItem) => void;
  onDelete: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
<<<<<<< Updated upstream
    defaultValues: {
      name: item.name,
      sku: item.sku ?? "",
      price: item.price,
      stock: item.stock,
      cat: item.cat,
      sizes: item.sizes ?? [],
      desc: item.desc ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: item.name,
      sku: item.sku ?? "",
      price: item.price,
      stock: item.stock,
      cat: item.cat,
      sizes: item.sizes ?? [],
      desc: item.desc ?? "",
    });
    setImageUrl(item.imageUrl ?? "");
  }, [item, form]);
=======
    defaultValues: toFormValues(item),
  });



>>>>>>> Stashed changes

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      return await presignedUpload(file);
    } finally {
      setUploading(false);
    }
  }, []);

  const onSubmit = (data: ProductFormData) => {
    onSave({ ...data, imageUrl });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2.5 h-full"
      >
        <div className="text-[12px] font-semibold text-[var(--ink-mute)] uppercase tracking-wide mb-0.5">
          Edit product
        </div>

        <ProductFormBody
          form={form}
          categoryOptions={[...CATEGORIES]}
          imageUrl={imageUrl || null}
          onImageChange={(v) => setImageUrl(v ?? "")}
          onUpload={handleUpload}
          isUploading={uploading}
<<<<<<< Updated upstream
          compact
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">Name *</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11.5px]">SKU</FormLabel>
                <FormControl>
                  <Input placeholder="SKU" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cat"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11.5px]">Category</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11.5px]">Price (PKR) *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11.5px]">Stock *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">Description</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sizes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">Available Sizes</FormLabel>
              <FormControl>
                <SizeSelector
                  category={selectedCategory}
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
=======
>>>>>>> Stashed changes
        />

        <div className="flex gap-2 mt-auto pt-2 border-t border-[var(--line)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <X size={12} /> Remove
          </Button>
          <Button type="submit" size="sm" className="flex-1 justify-center">
            <Check size={12} /> Apply
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Product mini-card ──────────────────────────────────────
function BulkCard({
  item,
  index,
  active,
  onClick,
  onRemove,
}: {
  item: BulkItem;
  index: number;
  active: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  const bad = !item.name || item.price <= 0 || item.stock < 0;
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col gap-1.5 rounded-[10px] border cursor-pointer p-[8px] transition-all
        ${active ? "border-[var(--accent)] bg-[var(--accent-soft)]" : bad ? "border-[#FCA5A5] bg-[var(--surface)]" : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]"}`}
    >
      {/* Image */}
      <div className="w-full h-[72px] rounded-[7px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center">
        {item.imageUrl ? (
          <ShimmerImage
            src={getImageUrl(item.imageUrl)}
            alt={item.name}
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon size={20} className="text-[var(--ink-mute)] opacity-40" />
        )}
      </div>
      <div className="text-[12px] font-medium truncate">
        {item.name || `Item ${index + 1}`}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-[var(--font-mono)] text-[var(--ink-soft)]">
          {item.price ? pkr(item.price) : "—"}
        </span>
        <span
          className={`badge py-px px-1.5 font-medium ${item.stock > 0 ? "bg-[rgba(34,197,94,0.12)] text-[#15803D]" : "bg-[rgba(239,68,68,0.12)] text-[#DC2626]"}`}
        >
          {item.stock}
        </span>
      </div>
      {bad && (
        <div className="absolute top-1.5 right-4 px-1 py-px rounded-full text-[9px] font-bold text-white bg-[#EF4444]">
          !
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-5 w-5"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X size={11} />
      </Button>
    </div>
  );
}

/** Columns the importer recognises, with a one-line hint + example each.
 * Shown as guidance — any of these that appear are imported, the rest stay
 * empty for manual entry. */
const IMPORT_COLUMNS: { name: string; detail: string; example: string }[] = [
  {
    name: "name",
    detail: "Product / dish full name",
    example: "Flamez Special Pizza (Large)",
  },
  { name: "sku", detail: "Your internal item code", example: "PIZZA-FLAMEZ-L" },
  { name: "price", detail: "Selling price in PKR", example: "1900" },
  {
    name: "discountPercentage",
    detail: "Max discount allowed, 0–100",
    example: "10",
  },
  { name: "stock", detail: "Units in stock (skip for food)", example: "50" },
  { name: "category", detail: "Top-level category", example: "Food" },
  { name: "cuisine", detail: "Food cuisine / kitchen", example: "Fast Food" },
  { name: "dietaryTag", detail: "Diet label", example: "Halal" },
  { name: "type", detail: "Menu section", example: "Pizza" },
  { name: "gender", detail: "Apparel target gender", example: "Men" },
  { name: "color", detail: "Apparel colour", example: "Maroon" },
  { name: "sizes", detail: "Pipe-separated size list", example: "S | M | L" },
  {
    name: "description",
    detail: "Short item description",
    example: "Loaded with cheese & chicken",
  },
  {
    name: "image_urls",
    detail: "Pipe-separated image links",
    example: "https://…/a.jpg | https://…/b.jpg",
  },
];

/** What the empty sheet shows before any product exists. */
type EmptyMode = "choose" | "import";

// ── Main BulkAddDialog ─────────────────────────────────────
export function BulkAddDialog({
  open,
  onClose,
  onSaveAll,
  isSaving = false,
  initialItems,
  parsing = false,
}: {
  open: boolean;
  onClose: () => void;
  onSaveAll: (items: BulkItem[]) => void;
  isSaving?: boolean;
  /** Rows parsed from an imported file — seeded for review before saving. */
  initialItems?: BulkItem[];
  /** Show a parsing overlay while the imported file is being read. */
  parsing?: boolean;
}) {
  const [items, setItems] = useState<BulkItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [emptyMode, setEmptyMode] = useState<EmptyMode>("choose");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setItems(initialItems ?? []);
      setSelectedIdx(initialItems && initialItems.length > 0 ? 0 : null);
      setEmptyMode("choose");
    }
    // Only re-seed on open / when a fresh import arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialItems]);

  const addItems = (newItems: BulkItem[]) => {
    setItems((prev) => {
      const next = [...prev, ...newItems];
      if (prev.length === 0 && newItems.length > 0) setSelectedIdx(0);
      return next;
    });
  };

  // Append a blank product and open it in the editor.
  const appendEmptyItem = () => {
    setItems((prev) => {
      setSelectedIdx(prev.length);
      return [...prev, EMPTY_ITEM()];
    });
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = file.name.endsWith(".json")
          ? parseJSON(text)
          : parseCSV(text);
        addItems(parsed);
        toast.success(
          `${parsed.length} product${parsed.length !== 1 ? "s" : ""} imported`,
        );
      } catch (err) {
        toast.error(extractErrorMessage(err));
      }
    };
    reader.readAsText(file);
  };

  const valid =
    items.length > 0 &&
    items.every((p) => {
      if (!p.name) return false;
      if (p.cat?.toLowerCase() === "food") {
        return Array.isArray(p.variants) && p.variants.length > 0 && p.variants.every((v) => v.price > 0);
      }
      return p.price > 0 && p.stock >= 0;
    });
  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;

  const updateItem = (idx: number, data: BulkItem) => {
    setItems((prev) => prev.map((x, i) => (i === idx ? data : x)));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setSelectedIdx((prev) => {
      if (prev === null) return null;
      if (prev === idx) return items.length > 1 ? Math.max(0, idx - 1) : null;
      return prev > idx ? prev - 1 : prev;
    });
  };

  const hasItems = items.length > 0;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v && !isSaving) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 min-h-[80vh] rounded-t-2xl overflow-hidden"
      >
        {/* Parsing overlay — shown while an imported file is being read */}
        {parsing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[var(--surface)]/85 backdrop-blur-sm">
            <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
            <span className="text-[13px] font-medium text-[var(--ink-soft)]">
              Reading your file…
            </span>
            <span className="text-[11.5px] text-[var(--ink-mute)]">
              Review the rows before saving
            </span>
          </div>
        )}

        {/* Shared hidden file input — used by both the empty-state importer and
            the header Import button. */}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) parseFile(f);
            e.target.value = "";
          }}
        />

        {/* Header */}
        <SheetHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-3.5 border-b border-[var(--line)]">
          <div>
            <SheetTitle className="text-[16px] font-semibold">
              Bulk add products
            </SheetTitle>
            <SheetDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Import CSV / JSON or add manually. Select a card to edit details
              and upload images.
            </SheetDescription>
          </div>
<<<<<<< Updated upstream
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </DialogHeader>

        {/* Drop zone */}
        <div className="px-5 pt-3 flex-shrink-0">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) parseFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex items-center gap-3 rounded-[10px] cursor-pointer transition-all py-3 px-4
              ${dragOver ? "border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)]"}`}
          >
            <span className="w-8 h-8 rounded-[9px] inline-flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
              <Upload size={16} />
            </span>
            <div className="flex-1 text-[12.5px]">
              <span className="font-medium">Drop CSV or JSON</span>
              <span className="text-[var(--ink-mute)]">
                {" "}
                · columns:{" "}
                <code>
                  name, sku, price, stock, category, description, image_url
                </code>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
            >
              Browse
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) parseFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Body: left list + right edit panel */}
        <div className="flex flex-1 min-h-0 gap-0">
          {/* Left: card list */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--line)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-2 border-b border-[var(--line)]">
              <span className="text-[12px] text-[var(--ink-soft)]">
                {items.length === 0
                  ? "No products yet"
                  : `${items.length} product${items.length > 1 ? "s" : ""}`}
              </span>
=======
          <div className="flex items-center gap-2">
            {/* {hasItems && (
>>>>>>> Stashed changes
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={13} /> Import
              </Button>
            )} */}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </SheetHeader>

        {/* ── Empty state: no columns, just the add options ── */}
        {!hasItems ? (
          <div className="flex flex-1 min-h-0 items-center justify-center overflow-y-auto p-6">
            {emptyMode === "choose" ? (
              <div className="grid w-full max-w-[620px] gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={appendEmptyItem}
                  className="flex flex-col items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5 text-left transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Plus size={18} />
                  </span>
                  <span className="text-[13.5px] font-semibold">
                    Add manually
                  </span>
                  <span className="text-[12px] text-[var(--ink-mute)]">
                    Enter products one at a time and upload their images.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEmptyMode("import")}
                  className="flex flex-col items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5 text-left transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Upload size={18} />
                  </span>
                  <span className="text-[13.5px] font-semibold">
                    Import CSV / JSON
                  </span>
                  <span className="text-[12px] text-[var(--ink-mute)]">
                    Bring in many products at once from a spreadsheet or export.
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex w-full max-w-[620px] flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setEmptyMode("choose")}
                  className="self-start text-[12px] text-[var(--ink-mute)] hover:text-[var(--accent)]"
                >
                  ← Back
                </button>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) parseFile(f);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all py-10 px-4 text-center
                    ${dragOver ? "border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)]"}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Upload size={18} />
                  </span>
                  <span className="text-[13px] font-medium">
                    Drop a CSV or JSON file, or click to browse
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--line)] p-4">
                  <p className="text-[12px] font-medium text-[var(--ink-soft)]">
                    Columns we recognise
                  </p>
                  <p className="mt-0.5 mb-3 text-[11.5px] text-[var(--ink-mute)]">
                    Just guidance — whichever of these appear get imported, the
                    rest stay empty for you to fill in manually.
                  </p>
                  <dl className="flex flex-col divide-y divide-[var(--line)]">
                    {IMPORT_COLUMNS.map((col) => (
                      <div
                        key={col.name}
                        className="grid grid-cols-[130px_1fr] gap-3 py-1.5 first:pt-0 last:pb-0"
                      >
                        <dt className="font-mono text-[12px] font-semibold text-[var(--ink)]">
                          {col.name}
                        </dt>
                        <dd className="text-[12px] text-[var(--ink-soft)]">
                          {col.detail}
                          <span className="text-[var(--ink-mute)]">
                            {" "}
                            — e.g. {col.example}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Two-column layout: card list + inline editor ── */
          <div className="flex flex-1 min-h-0 gap-0">
            {/* Left: card list */}
            <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--line)] overflow-hidden w-2/3">
              <div className="flex items-center justify-between px-5 py-2 border-b border-[var(--line)]">
                <span className="text-[12px] text-[var(--ink-soft)]">
                  {`${items.length} product${items.length > 1 ? "s" : ""}`}
                </span>
                <Button variant="outline" size="sm" onClick={appendEmptyItem}>
                  <Plus size={11} /> Add
                </Button>
              </div>
              <div className="scroll flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
                  {items.map((item, i) => (
                    <BulkCard
                      key={i}
                      item={item}
                      index={i}
                      active={selectedIdx === i}
                      onClick={() => setSelectedIdx(i)}
                      onRemove={() => removeItem(i)}
                    />
                  ))}
                  <button
                    onClick={appendEmptyItem}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)] min-h-[130px] cursor-pointer text-[var(--ink-mute)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Plus size={18} />
                    <span className="text-[11.5px] font-medium">
                      Add product
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: edit panel */}
            <div className="w-1/3 not-even:shrink-0 flex flex-col overflow-hidden">
              {selectedItem !== null && selectedIdx !== null ? (
                <div className="scroll flex-1 overflow-y-auto p-4">
                  <EditPanel
                    key={selectedIdx}
                    item={selectedItem}
                    onSave={(data) => updateItem(selectedIdx, data)}
                    onDelete={() => removeItem(selectedIdx)}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--ink-mute)] p-6 text-center">
                  <ImageIcon size={28} className="opacity-30" />
                  <span className="text-[12.5px]">
                    Select a product card to edit it
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--line)] flex-shrink-0">
          <span
            className={`text-[12px] flex items-center gap-1.5 ${valid ? "text-[var(--ink-soft)]" : "text-[#B45309]"}`}
          >
            {isSaving ? (
              <>
                <Loader2
                  size={12}
                  className="animate-spin text-[var(--accent)]"
                />{" "}
                Saving {items.length} product{items.length === 1 ? "" : "s"}…
              </>
            ) : hasItems ? (
              valid ? (
                <>
                  <Check size={12} className="text-[#15803D]" /> All{" "}
                  {items.length} ready to save
                </>
              ) : (
                "Some products need details — click a card to edit"
              )
            ) : (
              "Add a product or import a file to begin"
            )}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              disabled={!valid || isSaving}
              onClick={() => onSaveAll(items)}
            >
              {isSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check size={13} /> Save {items.length || ""} product
                  {items.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
