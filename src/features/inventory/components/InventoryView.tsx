"use client";
import { useAppStore } from "@/lib/appStore";
import { parseCsv } from "@/lib/csv";
import { cn, getImageUrl, pkr } from "@/lib/utils";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { ImageUploader } from "@/shared/ui/ImageUploader";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/shared/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import { Skeleton } from "@/shared/ui/Motion";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
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
import {
  Check,
  ChevronDown,
  Cloud,
  Copy,
  Crown,
  Download,
  Grid2x2,
  ImageIcon,
  Link,
  List,
  Lock,
  Package,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  useAddProduct,
  useBulkAddProducts,
  useDeleteProduct,
  useDuplicateProduct,
  usePresignedUpload,
  useProducts,
  useUpdateProduct,
} from "../hooks/useProducts";
import type {
  InventoryView as InvViewType,
  Product,
  ProductFormData,
} from "../types";
import {
  CATEGORIES,
  ERP_SYSTEMS,
  GENDERS,
  STOREFRONTS,
  TIERS,
  productSchema,
} from "../types";
import { BulkAddDialog, type BulkItem } from "./BulkAddDialog";
import { CreatableCategorySelect } from "./CreatableCategorySelect";
import { SizeSelector } from "./SizeSelector";

function stockStatus(stock: number): Product["status"] {
  if (stock === 0) return "out";
  if (stock <= 12) return "low";
  return "in";
}

const STOCK_LABEL: Record<Product["status"], string> = {
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

function exportProductsCsv(rows: Product[]): void {
  const headers = ["Name", "SKU", "Category", "Price", "Stock", "Status"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const p of rows) {
    lines.push(
      [
        p.name,
        p.sku,
        p.cat,
        p.price,
        p.stock,
        STOCK_LABEL[stockStatus(p.stock)],
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
  a.download = `inventory_export_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ProductDialog({
  open,
  initial,
  title,
  categoryOptions,
  isSaving,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  initial?: Product | null;
  title?: string;
  categoryOptions: string[];
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData & { imageUrls: string[] }) => void;
  onDelete?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { upload: uploadImage, isPending: isUploading } = usePresignedUpload();

  const form = useForm<z.input<typeof productSchema>, unknown, ProductFormData>(
    {
      resolver: zodResolver(productSchema),
      defaultValues: {
        name: "",
        sku: "",
        price: 0,
        stock: 0,
        cat: "Apparel",
        sizes: [],
        gender: "",
        color: "",
        desc: "",
      },
    },
  );

  useEffect(() => {
    if (open) {
      setImageUrl(initial?.imageUrls?.[0] ?? null);
      form.reset(
        initial
          ? {
              name: initial.name ?? "",
              sku: initial.sku ?? "",
              price: initial.price ?? 0,
              stock: initial.stock ?? 0,
              cat: initial.cat ?? "Apparel",
              sizes: initial.sizes ?? [],
              gender: initial.gender ?? "",
              color: initial.color ?? "",
              desc: initial.desc ?? "",
            }
          : {
              name: "",
              sku: "",
              price: 0,
              stock: 0,
              cat: "Apparel",
              sizes: [],
              gender: "",
              color: "",
              desc: "",
            },
      );
    }
  }, [open, initial, form]);

  const selectedCategory = useWatch({ control: form.control, name: "cat" });

  const handleSubmit = (data: ProductFormData) => {
    onSave({ ...data, imageUrls: imageUrl ? [imageUrl] : [] });
  };

  const busy = isSaving || isDeleting || isUploading;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-w-[540px] overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-[18px] py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">
              {title || "Add Product"}
            </DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Tier 1 · Manual Catalog
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={busy}
          >
            <X size={18} />
          </Button>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-1 min-h-0 flex-col overflow-hidden"
          >
            <div className="scroll overflow-y-auto flex-1 min-h-0 flex flex-col gap-3 p-[18px]">
            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              onUpload={uploadImage}
              isUploading={isUploading}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lawn Suit 3-Piece Unstitched"
                      autoFocus
                      {...field}
                      disabled={busy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="LWN-3P-001"
                        {...field}
                        disabled={busy}
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CreatableCategorySelect
                        options={categoryOptions}
                        value={field.value ?? ""}
                        onChange={(v) => field.onChange(v)}
                        disabled={busy}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={busy}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Maroon"
                        {...field}
                        disabled={busy}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8999"
                        {...field}
                        disabled={busy}
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
                    <FormLabel>Stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="47"
                        {...field}
                        disabled={busy}
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Premium unstitched lawn fabric, 3-piece set..."
                      {...field}
                      disabled={busy}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Sizes</FormLabel>
                  <FormControl>
                    <SizeSelector
                      category={selectedCategory}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={busy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            <div className="flex-shrink-0 flex justify-between gap-2 px-[18px] py-3 border-t border-[var(--line)] bg-[var(--surface)]">
              {onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={busy}
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin inline-block mr-1.5 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} /> Remove
                    </>
                  )}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {isSaving ? (
                    <>
                      <span className="animate-spin inline-block mr-1.5 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────── Tier Card ────────────────────
const TIER_ICONS = [Package, Link, Cloud, Shield] as const;

function TierCard({
  tier,
  active,
  onClick,
}: {
  tier: (typeof TIERS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = TIER_ICONS[tier.id - 1];
  const disabled = tier.id > 1;

  return (
    <div
      className={cn(
        "card relative flex flex-col gap-2 h-full p-[14px]",
        disabled
          ? "opacity-60 cursor-not-allowed border-[var(--line)] bg-[var(--surface-2)]"
          : active
            ? "cursor-pointer border-[var(--accent)] bg-[var(--accent-soft)]"
            : "cursor-pointer border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]",
      )}
      onClick={disabled ? undefined : onClick}
    >
      {disabled && (
        <span className="absolute top-2 right-2">
          <Lock size={11} className="text-[var(--ink-mute)]" />
        </span>
      )}
      <div className="flex items-center justify-between">
        <div
          className={[
            "w-8 h-8 rounded-[9px] flex items-center justify-center",
            active && !disabled
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]",
          ].join(" ")}
        >
          <Icon size={15} />
        </div>
        {disabled ? (
          <span className="badge font-medium bg-[var(--surface-2)] text-[var(--ink-mute)] border border-[var(--line)] text-[10px]">
            Coming soon
          </span>
        ) : (
          <span className="badge font-medium bg-[var(--surface-2)] text-[var(--ink-mute)] border border-[var(--line)]">
            Tier {tier.id}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-[13.5px] font-medium">{tier.name}</h4>
        <div className="text-[11.5px] mt-0.5 leading-relaxed text-[var(--ink-soft)]">
          {tier.desc}
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px] text-[var(--ink-mute)]">{tier.count}</span>
        {active && !disabled && (
          <Check size={13} className="text-[var(--accent)]" />
        )}
      </div>
    </div>
  );
}

// ──────────────────── Product Grid Card ────────────────────
function ProductGridCard({
  p,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  p: Product;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const statusCls =
    p.status === "in"
      ? "rgba(34,197,94,0.92)"
      : p.status === "low"
        ? "rgba(245,158,11,0.92)"
        : "rgba(239,68,68,0.92)";
  const statusLabel =
    p.status === "in" ? "In stock" : p.status === "low" ? "Low" : "Out";

  return (
    <div
      className="card overflow-hidden flex flex-col p-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square">
        {p.imageUrls && p.imageUrls.length > 0 ? (
          <ShimmerImage
            src={getImageUrl(p.imageUrls[0])}
            alt={p.name}
            wrapperClassName="absolute inset-0"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="placeholder-img absolute inset-0 rounded-none aspect-auto h-full flex items-center justify-center text-[var(--ink-mute)] opacity-50 bg-[var(--surface-2)]">
            <ImageIcon size={28} />
          </div>
        )}
        <span
          className="badge absolute top-2 right-2 font-medium text-white backdrop-blur-sm"
          style={{ background: statusCls }}
        >
          {statusLabel}
        </span>
        <div
          className={cn(
            "absolute inset-0 flex items-end gap-1.5 p-2.5 transition-opacity duration-150 bg-[linear-gradient(to_top,rgba(15,23,42,0.55),transparent_50%)]",
            hovered ? "opacity-100" : "opacity-0",
          )}
        >
          <Button
            size="sm"
            className="flex-1 bg-white/95 text-[var(--ink)] hover:bg-white"
            onClick={onEdit}
          >
            <Pencil size={12} /> Edit
          </Button>
          <Button
            size="icon-sm"
            className="bg-white/95 text-[var(--ink)] hover:bg-white"
            onClick={onDuplicate}
            title="Duplicate"
          >
            <Copy size={13} />
          </Button>
          <Button
            size="icon-sm"
            className="bg-[rgba(239,68,68,0.95)] text-white hover:bg-[rgba(239,68,68,1)]"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      <div className="p-[10px]">
        <div className="text-[12.5px] font-medium truncate text-[var(--ink)]">
          {p.name}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-[13px] font-[var(--font-mono)] text-[var(--ink)]">
            {pkr(p.price)}
          </span>
          <span className="text-[11px] text-[var(--ink-mute)]">
            {p.stock} pcs
          </span>
        </div>
        <div className="text-[10.5px] mt-0.5 text-[var(--ink-mute)] font-[var(--font-mono)]">
          {p.sku || "—"}
        </div>
      </div>
    </div>
  );
}

// ──────────────────── Add Menu Item ────────────────────
function AddMenuItem({
  Icon,
  title,
  sub,
  onClick,
}: {
  Icon: React.ElementType;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-left hover:bg-[var(--surface-2)] transition-colors"
    >
      <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center flex-shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon size={13} />
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-medium text-[var(--ink)]">{title}</div>
        <div className="text-[11px] text-[var(--ink-mute)]">{sub}</div>
      </div>
    </button>
  );
}

// ──────────────────── InventoryView (root) ────────────────────
export function InventoryView() {
  const { data: products = [], isLoading } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();
  const bulkAddProducts = useBulkAddProducts();
  const { inventoryView, setInventoryView } = useAppStore();

  const [tierParam, setTierParam] = useUrlState("tier", "1");
  const tier = Number(tierParam) || 1;
  const setTier = (t: number) => setTierParam(String(t));
  const [search, setSearch] = useUrlState("q");
  const [filterCat, setFilterCat] = useUrlState("cat");
  const [filterStockParam, setFilterStock] = useUrlState("stock");
  const filterStock = filterStockParam as "" | "in" | "low" | "out";
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [singleOpen, setSingleOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [importedItems, setImportedItems] = useState<BulkItem[] | undefined>(
    undefined,
  );
  const [parsingImport, setParsingImport] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // Categories shown in the picker: the built-in set plus whatever existing
  // products already use (so previously-created ones keep showing up).
  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of [...CATEGORIES, ...products.map((p: Product) => p.cat)]) {
      const key = c?.trim().toLowerCase();
      if (!c || !key || seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }, [products]);
  const importRef = useRef<HTMLInputElement>(null);
  const importType = useRef<"csv" | "json">("csv");
  const addMenuRef = useRef<HTMLDivElement>(null);

  const isSaving = addProduct.isPending || updateProduct.isPending;
  const isDeleting = deleteProduct.isPending;

  useEffect(() => {
    if (!addMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node))
        setAddMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addMenuOpen]);

  const filtered = products.filter((p: Product) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filterCat && p.cat !== filterCat) return false;
    const stock = stockStatus(p.stock);
    if (filterStock && stock !== filterStock) return false;
    return true;
  });

  const closeDialog = () => {
    setSingleOpen(false);
    setEditing(null);
  };

  const handleSave = (data: ProductFormData & { imageUrls: string[] }) => {
    const payload = {
      name: data.name,
      sku: data.sku || undefined,
      price: data.price,
      stock: data.stock,
      description: data.desc || undefined,
      category: data.cat || undefined,
      sizes: data.sizes ?? [],
      gender: data.gender || undefined,
      color: data.color || undefined,
      imageUrls: data.imageUrls,
    };
    if (editing?.id) {
      updateProduct.mutate(
        { id: editing.id, data: payload },
        { onSuccess: closeDialog },
      );
    } else {
      addProduct.mutate(payload, { onSuccess: closeDialog });
    }
  };

  // Imported files are parsed into review cards and opened in the bulk dialog.
  // Nothing is written to the DB until the user confirms there.
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportedItems(undefined);
    setParsingImport(true);
    setBulkOpen(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        let rows: Record<string, string>[] = [];
        if (importType.current === "json") {
          const j = JSON.parse(text);
          rows = Array.isArray(j) ? j : (j.products ?? []);
        } else {
          rows = parseCsv(text);
        }

        const items: BulkItem[] = rows
          .map((o) => ({
            name: o["name"] ?? o["product"] ?? "",
            sku: o["sku"] ?? "",
            price: Number(o["price"]) || 0,
            stock: Number(o["stock"]) || 0,
            cat: o["category"] ?? o["cat"] ?? "Apparel",
            sizes: [],
            desc: o["description"] ?? o["desc"] ?? "",
            imageUrl:
              o["image_url"] ??
              o["imageurl"] ??
              o["imageurls"] ??
              o["image"] ??
              o["img"] ??
              "",
          }))
          .filter((p) => p.name);

        if (items.length === 0) {
          toast.error("No valid rows found in the file");
          setBulkOpen(false);
        } else {
          setImportedItems(items);
        }
      } catch {
        toast.error("Failed to parse import file");
        setBulkOpen(false);
      } finally {
        setParsingImport(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setParsingImport(false);
      setBulkOpen(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const VIEW_BTNS: {
    id: InvViewType;
    label: string;
    Icon: React.ElementType;
  }[] = [
    { id: "grid", label: "Grid", Icon: Grid2x2 },
    { id: "list", label: "List", Icon: List },
  ];

  return (
    <div className="scroll overflow-y-auto h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-[20px] font-semibold">Inventory</h2>
          <div className="text-[12.5px] mt-0.5 text-[var(--ink-mute)]">
            {products.length} products · 1 active connection (Shopify)
          </div>
        </div>
      </div>

      {/* Tier selection */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[10px] mb-4">
        {TIERS.map((t) => (
          <TierCard
            key={t.id}
            tier={t}
            active={t.id === tier}
            onClick={() => setTier(t.id)}
          />
        ))}
      </div>

      {/* ── Tier 1: Manual Catalog ── */}
      {tier === 1 && (
        <div>
          <div className="card flex flex-col gap-2.5 mb-3 p-[10px]">
            {/* Row 1: search + view toggle + add */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative min-w-[200px] flex-[1_1_220px]">
                <Search
                  size={13}
                  className="absolute left-2.5 top-2.5 text-[var(--ink-mute)]"
                />
                <Input
                  className="pl-8"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={() => exportProductsCsv(filtered)}
                disabled={filtered.length === 0}
                title="Export current products to CSV"
              >
                <Download size={13} /> Export
              </Button>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={inventoryView}
                onValueChange={(v) => v && setInventoryView(v as InvViewType)}
              >
                {VIEW_BTNS.map(({ id, label, Icon }) => (
                  <ToggleGroupItem key={id} value={id} aria-label={label}>
                    <Icon size={12} /> {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <PermissionGuard permission="inventory:edit">
              <div ref={addMenuRef} className="relative">
                <Button onClick={() => setAddMenuOpen((v) => !v)}>
                  <Plus size={13} /> Add product <ChevronDown size={11} />
                </Button>
                {addMenuOpen && (
                  <div className="card-2 fade-up absolute right-0 top-[calc(100%+6px)] z-40 p-1.5 min-w-[220px] bg-[var(--surface)]">
                    <AddMenuItem
                      Icon={Plus}
                      title="Add a product"
                      sub="Single item, manual entry"
                      onClick={() => {
                        setAddMenuOpen(false);
                        setEditing(null);
                        setSingleOpen(true);
                      }}
                    />
                    <AddMenuItem
                      Icon={Copy}
                      title="Bulk add"
                      sub="Multiple at once with preview"
                      onClick={() => {
                        setAddMenuOpen(false);
                        setBulkOpen(true);
                      }}
                    />
                    <div className="h-px mx-1 my-1 bg-[var(--line)]" />
                    <AddMenuItem
                      Icon={Upload}
                      title="Import from CSV"
                      sub="Spreadsheet format"
                      onClick={() => {
                        setAddMenuOpen(false);
                        importType.current = "csv";
                        importRef.current?.click();
                      }}
                    />
                    <AddMenuItem
                      Icon={Upload}
                      title="Import from JSON"
                      sub="API export format"
                      onClick={() => {
                        setAddMenuOpen(false);
                        importType.current = "json";
                        importRef.current?.click();
                      }}
                    />
                  </div>
                )}
                <Input
                  ref={importRef}
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
              </PermissionGuard>
            </div>

            {/* Row 2: filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-[var(--ink-mute)] mr-1">
                Filter:
              </span>
              {/* Category chips */}
              {(["", ...categoryOptions] as string[]).map((cat) => (
                <Button
                  key={cat || "all-cat"}
                  size="xs"
                  variant={filterCat === cat ? "default" : "outline"}
                  onClick={() => setFilterCat(cat)}
                  className="rounded-full"
                >
                  {cat || "All"}
                </Button>
              ))}
              <div className="w-px h-4 bg-[var(--line)] mx-1" />
              {/* Stock status chips */}
              {(
                [
                  { id: "", label: "Any stock" },
                  { id: "in", label: "In stock" },
                  { id: "low", label: "Low stock" },
                  { id: "out", label: "Out" },
                ] as const
              ).map(({ id, label }) => (
                <Button
                  key={id || "any"}
                  size="xs"
                  variant={filterStock === id ? "default" : "outline"}
                  onClick={() => setFilterStock(id)}
                  className="rounded-full"
                >
                  {label}
                </Button>
              ))}
              {(filterCat || filterStock) && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setFilterCat("");
                    setFilterStock("");
                  }}
                  className="text-[var(--ink-mute)] hover:text-[var(--destructive)]"
                >
                  <X size={11} /> Clear
                </Button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--line)] overflow-hidden"
                >
                  <Skeleton className="h-[140px] w-full rounded-none" />
                  <div className="p-3 flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && inventoryView === "grid" && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {filtered.map((p: Product) => (
                <ProductGridCard
                  key={p.id}
                  p={p}
                  onEdit={() => {
                    setEditing(p);
                    setSingleOpen(true);
                  }}
                  onDelete={() => deleteProduct.mutate(p.id)}
                  onDuplicate={() => duplicateProduct.mutate(p)}
                />
              ))}
              <button
                onClick={() => {
                  setEditing(null);
                  setSingleOpen(true);
                }}
                className="card flex flex-col items-center justify-center gap-2 cursor-pointer p-[10px] border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)] min-h-[240px] text-[var(--ink-soft)]"
              >
                <span className="w-10 h-10 rounded-full inline-flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Plus size={18} />
                </span>
                <span className="text-[12.5px] font-medium">Add product</span>
              </button>
              {filtered.length === 0 && products.length > 0 && (
                <div className="col-span-full p-10 text-center text-[var(--ink-mute)]">
                  No products match your search.
                </div>
              )}
            </div>
          )}

          {!isLoading && inventoryView === "list" && (
            <DataTable<Product>
              data={filtered}
              columns={
                [
                  {
                    id: "name",
                    accessorFn: (p) => p.name,
                    header: "Product",
                    enableSorting: true,
                    cell: ({ row }) => {
                      const p = row.original;
                      return (
                        <div className="flex items-center gap-3">
                          {p.imageUrls && p.imageUrls.length > 0 ? (
                            <ShimmerImage
                              src={getImageUrl(p.imageUrls[0])}
                              alt={p.name}
                              wrapperClassName="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex-shrink-0"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="placeholder-img w-9 h-9 rounded-lg flex items-center justify-center text-[var(--ink-mute)] opacity-40 bg-[var(--surface-2)] flex-shrink-0">
                              <ImageIcon size={14} />
                            </div>
                          )}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      );
                    },
                  },
                  {
                    id: "sku",
                    accessorFn: (p) => p.sku,
                    header: "SKU",
                    enableSorting: true,
                    cell: ({ row }) => (
                      <span className="font-[var(--font-mono)] text-[11.5px] text-[var(--ink-mute)]">
                        {row.original.sku || "—"}
                      </span>
                    ),
                  },
                  {
                    id: "cat",
                    accessorFn: (p) => p.cat,
                    header: "Category",
                    enableSorting: true,
                    cell: ({ row }) => (
                      <span className="badge bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--line)]">
                        {row.original.cat}
                      </span>
                    ),
                  },
                  {
                    id: "price",
                    accessorFn: (p) => p.price,
                    header: "Price",
                    enableSorting: true,
                    cell: ({ row }) => (
                      <span className="font-medium font-[var(--font-mono)]">
                        {pkr(row.original.price)}
                      </span>
                    ),
                  },
                  {
                    id: "stock",
                    accessorFn: (p) => p.stock,
                    header: "Stock",
                    enableSorting: true,
                    cell: ({ row }) => (
                      <span className="font-[var(--font-mono)]">
                        {row.original.stock}
                      </span>
                    ),
                  },
                  {
                    id: "status",
                    accessorFn: (p) => p.status,
                    header: "Status",
                    enableSorting: true,
                    cell: ({ row }) => {
                      const s = row.original.status;
                      return s === "in" ? (
                        <span className="badge font-medium bg-[rgba(34,197,94,0.12)] text-[#15803D]">
                          In stock
                        </span>
                      ) : s === "low" ? (
                        <span className="badge font-medium bg-[rgba(245,158,11,0.14)] text-[#B45309]">
                          Low
                        </span>
                      ) : (
                        <span className="badge font-medium bg-[rgba(239,68,68,0.12)] text-[#DC2626]">
                          Out
                        </span>
                      );
                    },
                  },
                  {
                    id: "actions",
                    header: "Actions",
                    enableSorting: false,
                    cell: ({ row }) => {
                      const p = row.original;
                      return (
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditing(p);
                              setSingleOpen(true);
                            }}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => duplicateProduct.mutate(p)}
                          >
                            <Copy size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-[var(--destructive)]"
                            onClick={() => deleteProduct.mutate(p.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      );
                    },
                  },
                ] as ColumnDef<Product, unknown>[]
              }
              selectable
              onDeleteSelected={(rows) =>
                rows.forEach((p) => deleteProduct.mutate(p.id))
              }
              emptyMessage="No products match your filters."
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* ── Tier 2: URL Sync ── */}
      {tier === 2 && (
        <div className="card p-[22px]">
          <h3 className="text-[15px] font-semibold mb-1.5">URL Sync</h3>
          <p className="text-[13px] mb-4 text-[var(--ink-soft)]">
            Paste a product page URL — we extract title, price, images, and
            stock automatically.
          </p>
          <div className="flex gap-2 mb-4">
            <Input
              className="flex-1"
              placeholder="https://daraz.pk/products/lawn-suit-3-piece-..."
            />
            <Button>
              <Zap size={13} /> Extract
            </Button>
          </div>
          <div className="card flex gap-3 items-center p-3">
            <div className="placeholder-img w-16 h-16 aspect-auto">IMG</div>
            <div className="flex-1">
              <div className="font-medium">
                Lawn Suit 3-Piece — Pink Embroidery
              </div>
              <div className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
                daraz.pk · extracted just now
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <span className="entity-chip entity-money">Rs. 8,499</span>
                <span className="badge font-medium bg-[rgba(34,197,94,0.12)] text-[#15803D]">
                  In stock
                </span>
              </div>
            </div>
            <Button>Save</Button>
          </div>
        </div>
      )}

      {/* ── Tier 3: Storefront API ── */}
      {tier === 3 && (
        <div className="card p-[22px]">
          <h3 className="text-[15px] font-semibold mb-1">
            Storefront Connections
          </h3>
          <p className="text-[13px] mb-4 text-[var(--ink-soft)]">
            Connect your e-commerce platform for live two-way sync.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[10px]">
            {STOREFRONTS.map((s) => (
              <div key={s.name} className="card p-3">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className="w-[30px] h-[30px] rounded-lg flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0"
                    style={{ background: s.color }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[13px]">{s.name}</div>
                    <div className="text-[11px] text-[var(--ink-mute)]">
                      {s.acct}
                    </div>
                  </div>
                </div>
                {s.status === "connected" ? (
                  <Button variant="outline" className="w-full">
                    <Check size={12} /> Connected
                  </Button>
                ) : (
                  <Button className="w-full">
                    <Link size={12} /> Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tier 4: ERP ── */}
      {tier === 4 && (
        <div className="card p-[22px]">
          <div className="card flex items-center gap-3 mb-3.5 p-[14px] bg-[var(--surface-2)] border-[var(--accent)]">
            <span className="w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center flex-shrink-0 bg-[var(--accent)] text-white">
              <Crown size={16} />
            </span>
            <div className="flex-1">
              <div className="font-medium">Enterprise ERP · by invitation</div>
              <div className="text-[11.5px] text-[var(--ink-soft)]">
                Connect SAP, Oracle, Odoo. Real-time stock + order sync via
                secure middleware.
              </div>
            </div>
            <Button>Request access</Button>
          </div>
          <div className="grid grid-cols-3 gap-[10px]">
            {ERP_SYSTEMS.map((n) => (
              <div key={n} className="card text-center p-3">
                <Cloud size={18} className="text-[var(--accent)] mx-auto" />
                <div className="font-medium mt-1.5 text-[13px]">{n}</div>
                <div className="text-[11px] mt-0.5 text-[var(--ink-mute)]">
                  Coming Q3
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductDialog
        open={singleOpen}
        initial={editing}
        title={editing ? "Edit product" : "Add product"}
        categoryOptions={categoryOptions}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onClose={closeDialog}
        onSave={handleSave}
        onDelete={
          editing
            ? () => deleteProduct.mutate(editing.id, { onSuccess: closeDialog })
            : undefined
        }
      />

      <BulkAddDialog
        open={bulkOpen}
        onClose={() => {
          setBulkOpen(false);
          setImportedItems(undefined);
          setParsingImport(false);
        }}
        isSaving={bulkAddProducts.isPending}
        initialItems={importedItems}
        parsing={parsingImport}
        onSaveAll={(items) => {
          const payloads = items.map((p) => ({
            name: p.name,
            sku: p.sku || undefined,
            price: p.price,
            stock: p.stock,
            description: p.desc || undefined,
            sizes: p.sizes ?? [],
            imageUrls: p.imageUrl ? [p.imageUrl] : [],
          }));
          bulkAddProducts.mutate(payloads, {
            onSuccess: () => setBulkOpen(false),
          });
        }}
      />
    </div>
  );
}
