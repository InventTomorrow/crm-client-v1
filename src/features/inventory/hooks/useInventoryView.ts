import { useAppStore } from "@/lib/appStore";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { BulkItem, Product, ProductFormData } from "../types";
import { CATEGORIES } from "../types";
import { buildProductPayload } from "../utils/buildProductPayload";
import { parseProductImportFile } from "../utils/importProductsCsv";
import { stockStatus } from "../utils/stock";
import {
  useAddProduct,
  useBulkAddProducts,
  useDeleteProduct,
  useDuplicateProduct,
  useProducts,
  useUpdateProduct,
} from "./useProducts";

/** Owns all Inventory tab state, derived data, and mutation wiring so the
 * view component stays a thin render layer. */
export function useInventoryView() {
  const { data: products = [], isLoading } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
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
  const [singleOpen, setSingleOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [importedItems, setImportedItems] = useState<BulkItem[] | undefined>(
    undefined,
  );
  const [parsingImport, setParsingImport] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
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
      const s = stockStatus(p.stock, p.cat, p.inStock);
      if (s === "in") inStock++;
      else if (s === "low") low++;
      else out++;
    }
    return { inStock, low, out };
  }, [products]);

  const toggleStock = useCallback(
    (id: "in" | "low" | "out") => setFilterStock(filterStock === id ? "" : id),
    [filterStock, setFilterStock],
  );

  const debouncedSearch = useDebouncedValue(search);

  const filtered = useMemo(
    () =>
      products.filter((p: Product) => {
        if (
          debouncedSearch &&
          !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
          return false;
        if (filterCat && p.cat !== filterCat) return false;
        const stock = stockStatus(p.stock, p.cat, p.inStock);
        if (filterStock && stock !== filterStock) return false;
        return true;
      }),
    [products, debouncedSearch, filterCat, filterStock],
  );

  const closeDialog = useCallback(() => {
    setSingleOpen(false);
    setEditing(null);
  }, []);

  const openEditDialog = useCallback((p: Product) => {
    setEditing(p);
    setSingleOpen(true);
  }, []);

  const openAddDialog = useCallback(() => {
    setEditing(null);
    setSingleOpen(true);
  }, []);

  const openBulkDialog = useCallback(() => setBulkOpen(true), []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const fromEditor = editing?.id === id;
    deleteProduct.mutate(id, {
      onSuccess: () => {
        if (fromEditor) closeDialog();
      },
    });
    setDeleteTarget(null);
  }, [deleteTarget, editing, deleteProduct, closeDialog]);

  const confirmBulkDelete = useCallback(() => {
    bulkDeleteTargets.forEach((p) => deleteProduct.mutate(p.id));
    setBulkDeleteTargets([]);
  }, [bulkDeleteTargets, deleteProduct]);

  const handleSave = useCallback(
    (data: ProductFormData & { imageUrls: string[] }) => {
      const payload = buildProductPayload(data);

      if (editing?.id) {
        updateProduct.mutate(
          { id: editing.id, data: payload },
          { onSuccess: closeDialog },
        );
      } else {
        addProduct.mutate(payload, { onSuccess: closeDialog });
      }
    },
    [editing, updateProduct, addProduct, closeDialog],
  );

  // Imported files are parsed into review cards and opened in the bulk dialog.
  // Nothing is written to the DB until the user confirms there.
  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setImportedItems(undefined);
      setParsingImport(true);
      setBulkOpen(true);
      parseProductImportFile(file)
        .then((items) => {
          if (items.length === 0) {
            toast.error("No valid rows found in the file");
            setBulkOpen(false);
          } else {
            setImportedItems(items);
          }
        })
        .catch(() => {
          toast.error("Failed to parse import file");
          setBulkOpen(false);
        })
        .finally(() => setParsingImport(false));
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
      const payloads = items.map((p) =>
        buildProductPayload({
          ...p,
          imageUrls: p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : []),
        }),
      );
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
    singleOpen,
    bulkOpen,
    setBulkOpen,
    importedItems,
    parsingImport,
    editing,
    deleteTarget,
    setDeleteTarget,
    bulkDeleteTargets,
    setBulkDeleteTargets,
    exportOpen,
    setExportOpen,
    categoryOptions,
    importRef,
    addMenuRef,
    isSaving,
    isDeleting,
    stockCounts,
    filtered,
    closeDialog,
    openEditDialog,
    openAddDialog,
    openBulkDialog,
    confirmDelete,
    confirmBulkDelete,
    handleSave,
    handleImport,
    closeBulkDialog,
    saveBulkItems,
    duplicateProduct,
    deleteProduct,
    bulkAddProducts,
  };
}
