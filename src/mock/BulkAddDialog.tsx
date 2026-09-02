"use client";
import { extractErrorMessage, getImageUrl, pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { ImageUploader } from "@/shared/ui/ImageUploader";
import { Input } from "@/shared/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { Textarea } from "@/shared/ui/Textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { presignedUpload } from "@/features/inventory/services/productsService";
import type { BulkItem, ProductFormData } from "@/features/inventory/types";
import { CATEGORIES, productSchema } from "@/features/inventory/types";
import {
  parseProductsCsv,
  parseProductsJson,
} from "@/features/inventory/utils/importProductsCsv";
import { SizeSelector } from "@/features/inventory/components/SizeSelector";

export type { BulkItem };

const EMPTY_ITEM = (): BulkItem => ({
  name: "",
  sku: "",
  price: 0,
  discountPercentage: undefined,
  stock: 0,
  cat: "Apparel",
  sizes: [],
  gender: "",
  color: "",
  desc: "",
  // Bulk add does not configure customization — it is set per product afterwards.
  customOptionsEnabled: false,
  customOptionKeys: [],
  imageUrl: "",
  imageUrls: [],
});

/**
 * RETIRED — kept for reference only, not imported by any feature.
 *
 * Bulk add is gone and imports now run through ImportSheet → the
 * /inventory/import review page. See features/inventory/components/
 * ImportReviewView.tsx. Do not import this from a real page.
 */

// ── Inline Edit Panel ─────────────────────────────────────
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

  const form = useForm<z.input<typeof productSchema>, any, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: item.name,
      sku: item.sku ?? "",
      price: item.price,
      discountPercentage: item.discountPercentage ?? undefined,
      stock: item.stock,
      cat: item.cat,
      sizes: item.sizes ?? [],
      gender: item.gender ?? "",
      color: item.color ?? "",
      desc: item.desc ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: item.name,
      sku: item.sku ?? "",
      price: item.price,
      discountPercentage: item.discountPercentage ?? undefined,
      stock: item.stock,
      cat: item.cat,
      sizes: item.sizes ?? [],
      gender: item.gender ?? "",
      color: item.color ?? "",
      desc: item.desc ?? "",
    });
    setImageUrl(item.imageUrl ?? "");
  }, [item, form]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await presignedUpload(file);
      return url;
    } finally {
      setUploading(false);
    }
  }, []);

  const selectedCategory = useWatch({ control: form.control, name: "cat" });

  const onSubmit = (data: ProductFormData) => {
    onSave({ ...data, imageUrl, imageUrls: imageUrl ? [imageUrl] : [] });
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

        <ImageUploader
          value={imageUrl || null}
          onChange={(v) => setImageUrl(v ?? "")}
          onUpload={handleUpload}
          isUploading={uploading}
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

        <div className="grid grid-cols-3 gap-2">
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
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11.5px]">Max Disc %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ""}
                  />
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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setItems(initialItems ?? []);
      setSelectedIdx(initialItems && initialItems.length > 0 ? 0 : null);
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

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = file.name.endsWith(".json")
          ? parseProductsJson(text)
          : parseProductsCsv(text);
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
    items.every((p) => p.name && p.price > 0 && p.stock >= 0);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isSaving) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 sm:max-w-[900px] h-[min(680px,92vh)] overflow-hidden"
        showCloseButton={false}
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

        {/* Header */}
        <DialogHeader className="shrink-0 flex-row items-start justify-between gap-2 px-5 py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">
              Bulk add products
            </DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Import CSV / JSON or add manually. Select a card to edit details
              and upload images.
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </DialogHeader>

        {/* Drop zone */}
        <div className="px-5 pt-3 shrink-0">
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
                  name, sku, price, discountPercentage, stock, category, gender,
                  color, sizes, description, image_urls
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const idx = items.length;
                  setItems((prev) => [...prev, EMPTY_ITEM()]);
                  setSelectedIdx(idx);
                }}
              >
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
                  onClick={() => {
                    const idx = items.length;
                    setItems((prev) => [...prev, EMPTY_ITEM()]);
                    setSelectedIdx(idx);
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)] min-h-[130px] cursor-pointer text-[var(--ink-mute)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Plus size={18} />
                  <span className="text-[11.5px] font-medium">Add product</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: edit panel */}
          <div className="w-[300px] flex-shrink-0 flex flex-col overflow-hidden">
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
            ) : items.length > 0 ? (
              valid ? (
                <>
                  <Check size={12} className="text-[#15803D]" /> All{" "}
                  {items.length} ready to save
                </>
              ) : (
                "Some products need details — click a card to edit"
              )
            ) : (
              'Drop a file or click "Add product" to begin'
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
      </DialogContent>
    </Dialog>
  );
}
