"use client";
import { getImageUrl, pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { ImageIcon, X } from "lucide-react";
import type { BulkItem } from "../types";

/** Whether a row still needs attention before it can be saved. */
export function isImportItemValid(item: BulkItem): boolean {
  return Boolean(item.name) && item.price > 0 && item.stock >= 0;
}

/** One imported product in the review grid. */
export function ImportItemCard({
  item,
  index,
  active,
  onClick,
  onRemove,
}: Readonly<{
  item: BulkItem;
  index: number;
  active: boolean;
  onClick: () => void;
  onRemove: () => void;
}>) {
  const needsAttention = !isImportItemValid(item);

  return (
    <div
      onClick={onClick}
      className={`relative flex cursor-pointer flex-col gap-1.5 rounded-[10px] border p-[8px] transition-all
        ${
          active
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : needsAttention
              ? "border-[#FCA5A5] bg-[var(--surface)]"
              : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]"
        }`}
    >
      <div className="flex h-[72px] w-full items-center justify-center overflow-hidden rounded-[7px] bg-[var(--surface-2)]">
        {item.imageUrl ? (
          <ShimmerImage
            src={getImageUrl(item.imageUrl)}
            alt={item.name}
            wrapperClassName="w-full h-full"
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon size={20} className="text-[var(--ink-mute)] opacity-40" />
        )}
      </div>

      <div className="truncate text-[12px] font-medium">
        {item.name || `Item ${index + 1}`}
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="font-[var(--font-mono)] text-[var(--ink-soft)]">
          {item.price ? pkr(item.price) : "—"}
        </span>
        <span
          className={`badge px-1.5 py-px font-medium ${
            item.stock > 0
              ? "bg-[rgba(34,197,94,0.12)] text-[#15803D]"
              : "bg-[rgba(239,68,68,0.12)] text-[#DC2626]"
          }`}
        >
          {item.stock}
        </span>
      </div>

      {needsAttention && (
        <div className="absolute top-1.5 right-4 rounded-full bg-[#EF4444] px-1 py-px text-[9px] font-bold text-white">
          !
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${item.name || `item ${index + 1}`}`}
        className="absolute top-1 right-1 h-5 w-5"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <X size={11} />
      </Button>
    </div>
  );
}
