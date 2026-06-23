"use client";
import { extractErrorMessage, getImageUrl, pkr } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { ImageUploader } from "@/shared/ui/ImageUploader";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { parseCsv } from "@/lib/csv";
import { presignedUpload } from "../services/productsService";
import type { ProductFormData } from "../types";
import { CATEGORIES, productSchema } from "../types";

export interface BulkItem extends ProductFormData {
  imageUrl?: string;
}

const EMPTY_ITEM = (): BulkItem => ({
  name: "",
  sku: "",
  price: 0,
  stock: 0,
  cat: "Apparel",
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
      desc: p.description ?? p.desc ?? "",
      imageUrl: p.imageUrl ?? p.image_url ?? p.image ?? "",
    }))
    .filter((p) => p.name);
}

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
      stock: item.stock,
      cat: item.cat,
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

        {uploading ? (
          <div className="flex h-[80px] items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--accent)] bg-[var(--accent-soft)]">
            <Loader2 size={15} className="animate-spin text-[var(--accent)]" />
            <span className="text-[12px] text-[var(--accent)]">Uploading…</span>
          </div>
        ) : (
          <ImageUploader
            value={imageUrl || null}
            onChange={(v) => setImageUrl(v ?? "")}
            onUpload={handleUpload}
            compact
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">Name *</FormLabel>
              <FormControl>
                <input
                  className="input text-[12.5px] py-1.5"
                  placeholder="Product name"
                  {...field}
                />
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
                  <input
                    className="input text-[12.5px] py-1.5"
                    placeholder="SKU"
                    {...field}
                  />
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
                <FormControl>
                  <select className="input text-[12.5px] py-1.5" {...field}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormControl>
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
                  <input
                    className="input text-[12.5px] py-1.5"
                    type="number"
                    {...field}
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
                  <input
                    className="input text-[12.5px] py-1.5"
                    type="number"
                    {...field}
                  />
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
                <textarea className="input text-[12.5px]" rows={2} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 mt-auto pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            className="btn btn-ghost text-[#DC2626] text-[12px]"
            onClick={onDelete}
          >
            <X size={12} /> Remove
          </button>
          <button
            type="submit"
            className="btn btn-grad text-[12px] flex-1 justify-center"
          >
            <Check size={12} /> Apply
          </button>
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
      <button
        type="button"
        className="btn btn-ghost absolute top-1 right-1 p-0.5"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X size={11} />
      </button>
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
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">
              Bulk add products
            </DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Import CSV / JSON or add manually. Select a card to edit details
              and upload images.
            </DialogDescription>
          </div>
          <button className="btn btn-ghost p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
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
            <button
              className="btn btn-outline text-[12px]"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
            >
              Browse
            </button>
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
              <button
                className="btn btn-outline text-[11.5px] py-0.5 px-2"
                onClick={() => {
                  const idx = items.length;
                  setItems((prev) => [...prev, EMPTY_ITEM()]);
                  setSelectedIdx(idx);
                }}
              >
                <Plus size={11} /> Add
              </button>
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
            <button
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="btn btn-grad"
              disabled={!valid || isSaving}
              onClick={() => onSaveAll(items)}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin inline-block h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />{" "}
                  Saving…
                </>
              ) : (
                <>
                  <Check size={13} /> Save {items.length || ""} product
                  {items.length === 1 ? "" : "s"}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
