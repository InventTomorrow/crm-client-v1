import { useAppStore } from "@/lib/appStore";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../types";
import { CATEGORIES } from "../types";
import { stockStatus } from "../utils/stock";
import { useDeleteProduct, useDuplicateProduct, useProducts } from "./useProducts";

/** Owns all Inventory tab state, derived data, and mutation wiring so the
 * view component stays a thin render layer. */
export function useInventoryView() {
  const router = useRouter();
  const { data: products = [], isLoading, refetch, isFetching } = useProducts();
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();
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

  const goToImportProducts = useCallback(
    () => router.push("/inventory/import"),
    [router],
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteProduct.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteProduct]);

  const confirmBulkDelete = useCallback(() => {
    bulkDeleteTargets.forEach((p) => deleteProduct.mutate(p.id));
    setBulkDeleteTargets([]);
  }, [bulkDeleteTargets, deleteProduct]);

  return {
    products,
    isLoading,
    refetch,
    isFetching,
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
    deleteTarget,
    setDeleteTarget,
    previewProduct,
    setPreviewProduct,
    bulkDeleteTargets,
    setBulkDeleteTargets,
    exportOpen,
    setExportOpen,
    categoryOptions,
    addMenuRef,
    stockCounts,
    filtered,
    goToAddProduct,
    goToEditProduct,
    goToImportProducts,
    confirmDelete,
    confirmBulkDelete,
    duplicateProduct,
    deleteProduct,
  };
}
