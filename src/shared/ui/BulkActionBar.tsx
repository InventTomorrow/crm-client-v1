"use client";
import { cn } from "@/lib/utils";
import { Download, Trash2 } from "lucide-react";
import { Button } from "./Button";

interface BulkActionBarProps {
  selectedCount: number;
  onExport?: () => void;
  onDelete?: () => void;
  className?: string;
}

/** Replaces a table's search field while rows are selected. Height matches the h-10 search input. */
export function BulkActionBar({
  selectedCount,
  onExport,
  onDelete,
  className,
}: BulkActionBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cn(
        "flex min-h-10 items-center gap-2 text-[13px] text-[var(--ink-soft)]",
        className,
      )}
    >
      <span>
        <span className="font-medium text-[var(--ink)]">{selectedCount}</span>{" "}
        selected
      </span>
      {onExport && (
        <Button variant="outline" size="xl" onClick={onExport}>
          <Download size={13} /> Export
        </Button>
      )}
      {onDelete && (
        <Button variant="destructive" size="xl" onClick={onDelete}>
          <Trash2 size={13} /> Delete
        </Button>
      )}
    </div>
  );
}
