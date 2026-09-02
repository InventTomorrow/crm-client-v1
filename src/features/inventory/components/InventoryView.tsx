"use client";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable } from "@/shared/ui/DataTable";
import { ExportDialog } from "@/shared/ui/ExportDialog";
import { Input } from "@/shared/ui/Input";
import { Skeleton } from "@/shared/ui/Motion";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { RefreshButton } from "@/shared/ui/RefreshButton";
import { StatCard } from "@/shared/ui/StatCard";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  Grid2x2,
  List,
  Package,
  PackageCheck,
  PackageX,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { useInventoryView } from "../hooks/useInventoryView";
import type { InventoryView as InvViewType, Product } from "../types";
import { exportProductsCsv } from "../utils/exportProductsCsv";
import { buildProductColumns } from "../utils/productColumns";
import { AddMenuItem } from "./AddMenuItem";
import { ProductGridCard } from "./ProductGridCard";
import { ProductPreviewDialog } from "./ProductPreviewDialog";
import {
  ErpPanel,
  StorefrontPanel,
  UrlSyncPanel,
} from "./TierPlaceholderPanels";

const VIEW_BTNS: { id: InvViewType; label: string; Icon: React.ElementType }[] =
  [
    { id: "grid", label: "Grid", Icon: Grid2x2 },
    { id: "list", label: "List", Icon: List },
  ];

export function InventoryView() {
  const {
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
  } = useInventoryView();

  const columns = useMemo(
    () =>
      buildProductColumns({
        onEdit: goToEditProduct,
        onDuplicate: duplicateProduct.mutate,
        onDelete: setDeleteTarget,
      }),
    [goToEditProduct, duplicateProduct.mutate, setDeleteTarget],
  );

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

      {/* Stats */}
      <div
        data-tour="page-list"
        className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4"
      >
        <StatCard
          label="Total products"
          value={products.length}
          Icon={Package}
          active={!filterCat && !filterStock}
          onClick={() => {
            setFilterCat("");
            setFilterStock("");
          }}
        />
        <StatCard
          label="In stock"
          value={stockCounts.inStock}
          Icon={PackageCheck}
          accent="#16A34A"
          active={filterStock === "in"}
          onClick={() => toggleStock("in")}
        />
        <StatCard
          label="Low stock"
          value={stockCounts.low}
          Icon={AlertTriangle}
          accent="#B45309"
          active={filterStock === "low"}
          onClick={() => toggleStock("low")}
        />
        <StatCard
          label="Out of stock"
          value={stockCounts.out}
          Icon={PackageX}
          accent="#DC2626"
          active={filterStock === "out"}
          onClick={() => toggleStock("out")}
        />
      </div>

      {/* Tier selection */}
      {/* <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[10px] mb-4">
        {TIERS.map((t) => (
          <TierCard
            key={t.id}
            tier={t}
            active={t.id === tier}
            onClick={() => setTier(t.id)}
          />
        ))}
      </div> */}

      {/* ── Tier 1: Manual Catalog ── */}
      {tier === 1 && (
        <div>
          <div className="card flex flex-col gap-2.5 mb-3 p-[10px]">
            {/* Row 1: search + view toggle + add */}
            <div
              data-tour="page-actions"
              className="flex flex-wrap items-center gap-2.5"
            >
              <div className="relative w-full sm:min-w-[200px] sm:flex-[1_1_220px] sm:w-auto">
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
              <div className="hidden flex-1 sm:block" />
              <RefreshButton
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
              />
              <Button
                variant="outline"
                onClick={() => setExportOpen(true)}
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
                    <div className="card-2 fade-up absolute right-0 top-[calc(100%+6px)] z-40 w-[220px] max-w-[calc(100vw-2rem)] p-1.5 bg-[var(--surface)]">
                      <AddMenuItem
                        Icon={Plus}
                        title="Add a product"
                        sub="Single item, manual entry"
                        onClick={() => {
                          setAddMenuOpen(false);
                          goToAddProduct();
                        }}
                      />
                      <div className="h-px mx-1 my-1 bg-[var(--line)]" />
                      <AddMenuItem
                        Icon={Upload}
                        title="Import products"
                        sub="From a CSV or JSON file"
                        onClick={() => {
                          setAddMenuOpen(false);
                          goToImportProducts();
                        }}
                      />
                    </div>
                  )}
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
                  product={p}
                  highlight={!!highlightId && p.id === highlightId}
                  onPreview={setPreviewProduct}
                  onEdit={goToEditProduct}
                  onDelete={setDeleteTarget}
                  onDuplicate={duplicateProduct.mutate}
                />
              ))}
              <button
                onClick={goToAddProduct}
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
              columns={columns}
              selectable
              onRowClick={setPreviewProduct}
              onDeleteSelected={setBulkDeleteTargets}
              emptyMessage="No products match your filters."
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* ── Tier 2: URL Sync ── */}
      {tier === 2 && <UrlSyncPanel />}

      {/* ── Tier 3: Storefront API ── */}
      {tier === 3 && <StorefrontPanel />}

      {/* ── Tier 4: ERP ── */}
      {tier === 4 && <ErpPanel />}

      <ProductPreviewDialog
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
        onEdit={(product) => {
          setPreviewProduct(null);
          goToEditProduct(product);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete product?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from your catalog. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete product"
        loading={deleteProduct.isPending}
      />

      <ConfirmDialog
        open={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={confirmBulkDelete}
        title={`Delete ${bulkDeleteTargets.length} product${bulkDeleteTargets.length === 1 ? "" : "s"}?`}
        description="The selected products will be permanently removed. This can't be undone."
        confirmLabel="Delete products"
        loading={deleteProduct.isPending}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onConfirm={(name) => exportProductsCsv(filtered, name)}
        defaultName={`inventory_export_${new Date().toISOString().split("T")[0]}`}
        count={filtered.length}
        title="Export inventory"
      />
    </div>
  );
}
