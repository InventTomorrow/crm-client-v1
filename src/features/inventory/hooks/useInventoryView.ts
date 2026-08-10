import { useAppStore } from "@/lib/appStore";
import { parseCsv } from "@/lib/csv";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { BulkItem, Product } from "../types";
import { CATEGORIES } from "../types";
import { objectToRow, rowToBulkItem } from "../utils/importProductsCsv";
import { stockStatus } from "../utils/stock";
import {
  useBulkAddProducts,
  useDeleteProduct,
  useDuplicateProduct,
  useProducts,
} from "./useProducts";

/** Owns all Inventory tab state, derived data, and mutation wiring so the
 * view component stays a thin render layer. */
export function useInventoryView() {
  const router = useRouter();
  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();
  const bulkAddProducts = useBulkAddProducts();
  const { inventoryView, setInventoryView } = useAppStore();

  const [tierParam, setTierParam] = useUrlState("tier", "1");
  const tier = Number(tierParam) || 1;
  const setTier = useCallback(
    (t: number) => setTierParam(String(t)),
    [setTierParam],
  );
  const [search, setSearch] = useUrlState("q");
  // Set when arriving from an order item — rings + scrolls to that product, then clears.
  const [highlightId, setHighlightId] = useUrlState("highlight");
  const [filterCat, setFilterCat] = useUrlState("cat");
  const [filterStockParam, setFilterStock] = useUrlState("stock");
  const filterStock = filterStockParam as "" | "in" | "low" | "out";
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [importedItems, setImportedItems] = useState<BulkItem[] | undefined>(
    undefined,
  );
  const [parsingImport, setParsingImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<Product[]>([]);
  const [exportOpen, setExportOpen] = useState(false);

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

  useEffect(() => {
    if (!addMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node))
        setAddMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addMenuOpen]);

  // Clear the highlight from the URL after a moment so it doesn't persist on reload.
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(""), 3500);
    return () => clearTimeout(t);
  }, [highlightId, setHighlightId]);

  const stockCounts = useMemo(() => {
    let inStock = 0;
    let low = 0;
    let out = 0;
    for (const p of products as Product[]) {
      const s = stockStatus(p.stock);
      if (s === "in") inStock++;
      else if (s === "low") low++;
      else out++;
    }
    return { inStock, low, out };
  }, [products]);

  const toggleStock = useCallback(
    (id: "in" | "low" | "out") =>
      setFilterStock(filterStock === id ? "" : id),
    [filterStock, setFilterStock],
  );

  const filtered = useMemo(
    () =>
      products.filter((p: Product) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (filterCat && p.cat !== filterCat) return false;
        const stock = stockStatus(p.stock);
        if (filterStock && stock !== filterStock) return false;
        return true;
      }),
    [products, search, filterCat, filterStock],
  );

  const goToAddProduct = useCallback(
    () => router.push("/inventory/new"),
    [router],
  );

  const goToEditProduct = useCallback(
    (product: Product) => router.push(`/inventory/${product.id}/edit`),
    [router],
  );

  const openBulkDialog = useCallback(() => setBulkOpen(true), []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteProduct.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteProduct]);

  const confirmBulkDelete = useCallback(() => {
    bulkDeleteTargets.forEach((p) => deleteProduct.mutate(p.id));
    setBulkDeleteTargets([]);
  }, [bulkDeleteTargets, deleteProduct]);

  // Imported files are parsed into review cards and opened in the bulk dialog.
  // Nothing is written to the DB until the user confirms there.
  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const arr: Record<string, unknown>[] = Array.isArray(j)
              ? j
              : (j.products ?? []);
            rows = arr.map(objectToRow);
          } else {
            rows = parseCsv(text);
          }

          const items: BulkItem[] = rows
            .map(rowToBulkItem)
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
    },
    [],
  );

  const closeBulkDialog = useCallback(() => {
    setBulkOpen(false);
    setImportedItems(undefined);
    setParsingImport(false);
  }, []);

  const saveBulkItems = useCallback(
    (items: BulkItem[]) => {
      const payloads = items.map((p) => ({
        name: p.name,
        sku: p.sku || undefined,
        price: p.price,
        discountPercentage: p.discountPercentage,
        stock: p.stock,
        description: p.desc || undefined,
        category: p.cat || undefined,
        gender: p.gender || undefined,
        color: p.color || undefined,
        sizes: p.sizes ?? [],
        imageUrls: p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : []),
      }));
      bulkAddProducts.mutate(payloads, {
        onSuccess: () => setBulkOpen(false),
      });
    },
    [bulkAddProducts],
  );

  return {
    products,
    isLoading,
    inventoryView,
    setInventoryView,
    tier,
    setTier,
    search,
    setSearch,
    highlightId,
    filterCat,
    setFilterCat,
    filterStock,
    setFilterStock,
    toggleStock,
    addMenuOpen,
    setAddMenuOpen,
    bulkOpen,
    setBulkOpen,
    importedItems,
    parsingImport,
    deleteTarget,
    setDeleteTarget,
    previewProduct,
    setPreviewProduct,
    bulkDeleteTargets,
    setBulkDeleteTargets,
    exportOpen,
    setExportOpen,
    categoryOptions,
    importRef,
    importType,
    addMenuRef,
    stockCounts,
    filtered,
    goToAddProduct,
    goToEditProduct,
    openBulkDialog,
    confirmDelete,
    confirmBulkDelete,
    handleImport,
    closeBulkDialog,
    saveBulkItems,
    duplicateProduct,
    deleteProduct,
    bulkAddProducts,
  };
}
