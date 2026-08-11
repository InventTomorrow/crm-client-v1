"use client";
import { cn, getImageUrl, pkr } from "@/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Separator } from "@/shared/ui/Separator";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { ImageIcon, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../types";

const STATUS_STYLES: Record<
  Product["status"],
  { label: string; background: string }
> = {
  in: { label: "In stock", background: "rgba(34,197,94,0.92)" },
  low: { label: "Low stock", background: "rgba(245,158,11,0.92)" },
  out: { label: "Out of stock", background: "rgba(239,68,68,0.92)" },
};

/** Read-only detail view for a single product — opened by clicking its card in the inventory grid. */
export function ProductPreviewDialog({
  product,
  onClose,
  onEdit,
}: {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // A different product in the same dialog must start from its own first image.
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const images = product.imageUrls ?? [];
  const activeImage = images[activeImageIndex];
  const status = STATUS_STYLES[product.status];
  const discount = product.discountPercentage ?? 0;
  const discountedPrice =
    discount > 0 ? product.price * (1 - discount / 100) : null;
  const sizes = product.sizes?.length
    ? product.sizes
    : product.size
      ? [product.size]
      : [];

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="relative aspect-[16/9] bg-[var(--surface-2)]">
          {activeImage ? (
            <ShimmerImage
              src={getImageUrl(activeImage)}
              alt={product.name}
              wrapperClassName="absolute inset-0"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--ink-mute)] opacity-50">
              <ImageIcon size={32} />
            </div>
          )}
          <span
            className="badge absolute top-2.5 right-2.5 font-medium text-white backdrop-blur-sm"
            style={{ background: status.background }}
          >
            {status.label}
          </span>
        </div>

        {images.length > 1 && (
          <div className="flex items-center gap-2 px-5 pt-3 overflow-x-auto">
            {images.map((imageUrl, index) => (
              <button
                key={imageUrl}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={cn(
                  "relative size-12 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                  index === activeImageIndex
                    ? "border-[var(--accent)]"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <ShimmerImage
                  src={getImageUrl(imageUrl)}
                  alt={`${product.name} image ${index + 1}`}
                  wrapperClassName="absolute inset-0"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="scroll overflow-y-auto max-h-[52vh] px-5 py-4 flex flex-col gap-4">
          <DialogHeader className="p-0 gap-1 text-left">
            <DialogTitle className="text-[16px] leading-tight">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-[12px] font-[var(--font-mono)]">
              {product.sku || "No SKU"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-[20px] font-semibold font-[var(--font-mono)] text-[var(--ink)]">
              {pkr(discountedPrice ?? product.price)}
            </span>
            {discountedPrice !== null && (
              <>
                <span className="text-[13px] line-through font-[var(--font-mono)] text-[var(--ink-mute)]">
                  {pkr(product.price)}
                </span>
                <Badge variant="destructive">{discount}% off</Badge>
              </>
            )}
          </div>

          {product.desc && (
            <p className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
              {product.desc}
            </p>
          )}

          <Separator />

          <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-[12.5px]">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">
                Category
              </dt>
              <dd className="mt-0.5 text-[var(--ink)]">{product.cat || "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">
                Stock
              </dt>
              <dd className="mt-0.5 text-[var(--ink)]">{product.stock} pcs</dd>
            </div>
            {product.color && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">
                  Colour
                </dt>
                <dd className="mt-0.5 text-[var(--ink)]">{product.color}</dd>
              </div>
            )}
            {product.gender && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">
                  Gender
                </dt>
                <dd className="mt-0.5 text-[var(--ink)]">{product.gender}</dd>
              </div>
            )}
          </dl>

          {sizes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
                Sizes
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                {sizes.map((size) => (
                  <Badge key={size} variant="secondary">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[var(--border)] p-6 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(product)}>
            <Pencil size={13} /> Edit product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
