import { getImageUrl, pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import type { ColumnDef } from "@/shared/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { Copy, ImageIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Product } from "../types";

/** Builds the list-view column defs. Kept out of InventoryView so the row
 * action handlers (edit/duplicate/delete) don't force a fresh column array
 * on every unrelated render — callers should memoize on these callbacks. */
export function buildProductColumns({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onDelete: (p: Product) => void;
}): ColumnDef<Product, unknown>[] {
  return [
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
      id: "customization",
      accessorFn: (p) => (p.customOptionsEnabled ? "Custom" : ""),
      header: "Custom",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.customOptionsEnabled ? (
          <span className="badge bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--line)]">
            {row.original.customOptionKeys?.length ?? 0} option
            {(row.original.customOptionKeys?.length ?? 0) === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="text-[var(--ink-mute)]">—</span>
        ),
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
        <span className="font-[var(--font-mono)]">{row.original.stock}</span>
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
      header: "",
      size: 56,
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${p.name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onSelect={() => onEdit(p)}>
                <Pencil size={13} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDuplicate(p)}>
                <Copy size={13} /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete(p)}
              >
                <Trash2 size={13} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
