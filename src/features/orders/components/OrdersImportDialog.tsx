"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Check, FileText, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useOrdersImport } from "../hooks/useOrdersImport";
import { formatMoney } from "../lib/format";
import {
  ORDER_IMPORT_STATUSES,
  type OrderImportOutcome,
  type OrderImportResult,
  type OrderImportStatus,
} from "../types";

const IMPORT_STATUS_META: Record<
  OrderImportStatus,
  { label: string; className: string }
> = {
  ready: { label: "Ready", className: "bg-success-soft text-success" },
  created: { label: "Imported", className: "bg-success-soft text-success" },
  duplicate: {
    label: "Already exists",
    className: "bg-warning-soft text-warning",
  },
  invalid: {
    label: "Needs fixing",
    className: "bg-destructive-soft text-destructive",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive-soft text-destructive",
  },
};

const REQUIRED_COLUMNS =
  "order_number, item_name, item_quantity, item_unit_price, customer_contact";

const describeImportCounts = (counts: OrderImportResult["counts"]): string =>
  ORDER_IMPORT_STATUSES.filter((status) => counts[status] > 0)
    .map(
      (status) =>
        `${counts[status]} ${IMPORT_STATUS_META[status].label.toLowerCase()}`,
    )
    .join(" · ");

function ImportOutcomeRow({ outcome }: { outcome: OrderImportOutcome }) {
  const statusMeta = IMPORT_STATUS_META[outcome.status];
  const customerLabel = [outcome.customerName, outcome.customerContact]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-semibold text-[var(--ink)]">
              {outcome.orderNumber ? `#${outcome.orderNumber}` : "No order number"}
            </span>
            <span className="truncate text-[var(--ink-soft)]">
              {customerLabel}
            </span>
          </div>
          <div className="truncate text-[11.5px] text-[var(--ink-mute)]">
            {outcome.rowNumbers.length === 1 ? "Row" : "Rows"}{" "}
            {outcome.rowNumbers.join(", ")} · {outcome.itemCount} item
            {outcome.itemCount === 1 ? "" : "s"}
            {outcome.total !== null &&
              ` · ${formatMoney(outcome.total, outcome.currency ?? undefined)}`}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            statusMeta.className,
          )}
        >
          {statusMeta.label}
        </span>
      </div>
      {outcome.errors.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {outcome.errors.map((errorMessage, index) => (
            <li
              key={`${index}-${errorMessage}`}
              className={cn(
                "text-[11.5px]",
                outcome.status === "duplicate"
                  ? "text-warning"
                  : "text-destructive",
              )}
            >
              {errorMessage}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function OrdersImportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    selectedFileName,
    importResult,
    isCommitted,
    isPreviewing,
    isImporting,
    readyOrderCount,
    selectFile,
    confirmImport,
    reset,
  } = useOrdersImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const close = () => {
    if (isImporting) return;
    reset();
    onClose();
  };

  const pickFile = (file: File | undefined) => {
    if (file) void selectFile(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
      }}
    >
      <DialogContent className="flex max-h-[min(680px,92vh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b border-[var(--line)] px-5 py-4">
          <DialogTitle className="text-[16px] font-semibold">
            Import orders
          </DialogTitle>
          <DialogDescription className="text-[12px] text-[var(--ink-mute)]">
            One row per item. Rows that share an order_number become one order.
            Export your orders to get the exact format.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
          {!importResult ? (
            <button
              type="button"
              disabled={isPreviewing}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingFile(false);
                pickFile(event.dataTransfer.files[0]);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-dashed px-6 py-10 text-center transition-colors",
                isDraggingFile
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)]",
              )}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)]">
                {isPreviewing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
              </span>
              <span className="text-[13px] font-medium text-[var(--ink)]">
                {isPreviewing
                  ? `Checking ${selectedFileName ?? "file"}…`
                  : "Drop a CSV here or click to browse"}
              </span>
              <span className="text-[11.5px] text-[var(--ink-mute)]">
                Required columns: <code>{REQUIRED_COLUMNS}</code>
              </span>
            </button>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
                <FileText size={14} className="text-[var(--ink-mute)]" />
                <span className="max-w-[220px] truncate font-medium text-[var(--ink)]">
                  {selectedFileName}
                </span>
                <span className="text-[var(--ink-mute)]">
                  {describeImportCounts(importResult.counts)}
                </span>
                {!isCommitted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    Choose another file
                  </Button>
                )}
              </div>
              <ul className="scroll min-h-0 flex-1 divide-y divide-[var(--line)] overflow-y-auto rounded-[10px] border border-[var(--line)]">
                {importResult.orders.map((outcome, index) => (
                  <ImportOutcomeRow
                    key={`${outcome.orderNumber}-${index}`}
                    outcome={outcome}
                  />
                ))}
              </ul>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              pickFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--line)] px-5 py-3">
          {isCommitted ? (
            <Button onClick={close}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={close} disabled={isImporting}>
                Cancel
              </Button>
              <Button
                onClick={confirmImport}
                disabled={!readyOrderCount || isImporting || isPreviewing}
              >
                {isImporting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                Import {readyOrderCount} order{readyOrderCount === 1 ? "" : "s"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
