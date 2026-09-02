import { cn, getImageUrl, pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { Copy, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import type { Product } from "../types";

function ProductGridCardBase({
  product,
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
  highlight = false,
}: {
  product: Product;
  onPreview: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  highlight?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlight]);
  const statusCls =
    product.status === "in"
      ? "rgba(34,197,94,0.92)"
      : product.status === "low"
        ? "rgba(245,158,11,0.92)"
        : "rgba(239,68,68,0.92)";
  const statusLabel =
    product.status === "in"
      ? "In stock"
      : product.status === "low"
        ? "Low"
        : "Out";

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Preview ${product.name}`}
      className={cn(
        "card overflow-hidden flex flex-col p-0 transition-shadow cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        highlight &&
          "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]",
      )}
      onClick={() => onPreview(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPreview(product);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <ShimmerImage
            src={getImageUrl(product.imageUrls[0])}
            alt={product.name}
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
        {product.customOptionsEnabled && (
          <span className="badge absolute top-2 left-2 border border-[var(--line)] bg-[var(--surface)]/90 font-medium text-[var(--ink-soft)] backdrop-blur-sm">
            Custom
          </span>
        )}
        <div
          className={cn(
            "absolute inset-0 flex items-end gap-1.5 p-2.5 transition-opacity duration-150 bg-[linear-gradient(to_top,rgba(15,23,42,0.55),transparent_50%)]",
            hovered ? "opacity-100" : "opacity-0",
          )}
        >
          <Button
            size="sm"
            className="flex-1 bg-white/95 text-slate-900 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
          >
            <Pencil size={12} /> Edit
          </Button>
          <Button
            size="icon-sm"
            className="bg-white/95 text-slate-900 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(product);
            }}
            title="Duplicate"
          >
            <Copy size={13} />
          </Button>
          <Button
            size="icon-sm"
            className="bg-[rgba(239,68,68,0.95)] text-white hover:bg-[rgba(239,68,68,1)]"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product);
            }}
            title="Delete"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      <div className="p-[10px]">
        <div className="text-[12.5px] font-medium truncate text-[var(--ink)]">
          {product.name}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-[13px] font-[var(--font-mono)] text-[var(--ink)]">
            {pkr(product.price)}
          </span>
          <span className="text-[11px] text-[var(--ink-mute)]">
            {product.stock} pcs
          </span>
        </div>
        <div className="text-[10.5px] mt-0.5 text-[var(--ink-mute)] font-[var(--font-mono)]">
          {product.sku || "—"}
        </div>
      </div>
    </div>
  );
}

/** Grid re-renders whenever InventoryView's filters/search change; memoize
 * so unaffected cards skip re-render on every keystroke. */
export const ProductGridCard = memo(ProductGridCardBase);
