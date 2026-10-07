"use client";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Label } from "@/shared/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Pencil, Trash2 } from "lucide-react";
import type { CustomOptionEditor } from "../hooks/useCustomOptionEditor";
import {
  describeSurcharge,
  INPUT_TYPE_LABELS,
  type ProductCustomOption,
} from "../types";
import { CustomOptionEditorPanel } from "./CustomOptionEditorPanel";

/**
 * Which made-to-order options this product accepts.
 *
 * The options themselves belong to the workspace, not to this product: one
 * added here can be ticked on any product, and editing or deleting one changes
 * it everywhere. The tick decides only whether *this* product offers it.
 *
 * The editor is passed in so the section around this list can own its "Add option" button.
 */
export function ProductCustomOptions({
  editor,
  selectedKeys,
  onSelectedKeysChange,
  disabled,
}: Readonly<{
  editor: CustomOptionEditor;
  selectedKeys: string[];
  onSelectedKeysChange: (keys: string[]) => void;
  disabled: boolean;
}>) {
  if (editor.isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const offered = new Set(selectedKeys);

  /** Kept in pool order so the assistant asks them in a sensible sequence. */
  const setOffered = (key: string, isOffered: boolean) => {
    const next = new Set(offered);
    if (isOffered) next.add(key);
    else next.delete(key);
    onSelectedKeysChange(
      editor.options
        .filter((option) => next.has(option.key))
        .map((option) => option.key),
    );
  };

  // An option added while configuring this product is one the seller wants
  // offered here — ticking it saves an obvious second click. An edit to an
  // existing option must NOT tick it: that would silently opt this product in.
  const handleSaved = (saved: ProductCustomOption) => {
    if (editor.isAdding) setOffered(saved.key, true);
  };

  return (
    <div>
      <div>
        <Label>What customers can ask for</Label>
        <p className="text-muted-foreground mt-1 text-xs">
          Tick the ones this product accepts. The same list is shared by every
          product, so editing one changes it everywhere.
        </p>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {editor.options.map((option) => (
          <CustomOptionRow
            key={option.id}
            option={option}
            isOffered={offered.has(option.key)}
            onOfferedChange={(isOffered) => setOffered(option.key, isOffered)}
            onEdit={() => editor.startEditing(option)}
            onDelete={() => editor.setOptionPendingDeletion(option)}
            disabled={disabled}
          />
        ))}
      </ul>

      {editor.options.length === 0 && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
          Nothing here yet. Use Add option to set what customers can ask for — a
          size, a colour, a name to print — and the assistant will collect it
          before ordering.
        </p>
      )}

      {/* Closing the dialog any way other than saving discards the draft, like Cancel. */}
      <Dialog
        open={editor.editingId !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) editor.cancelEditing();
        }}
      >
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="gap-1 border-b border-[var(--line)] px-6 py-4 text-left">
            <DialogTitle className="text-base">
              {editor.isAdding ? "Add a custom option" : "Edit custom option"}
            </DialogTitle>
            <DialogDescription>
              Shared by every product, so editing it changes it everywhere.
            </DialogDescription>
          </DialogHeader>
          <CustomOptionEditorPanel editor={editor} onSaved={handleSaved} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(editor.optionPendingDeletion)}
        onClose={() => editor.setOptionPendingDeletion(null)}
        onConfirm={editor.confirmDeletion}
        loading={editor.isDeleting}
        title="Remove this option?"
        description={deletionWarning(
          editor.optionPendingDeletion,
          editor.productsOffering.length,
        )}
        confirmLabel="Remove option"
      />
    </div>
  );
}

/** Spells out the blast radius: the pool is shared, so a delete is never local. */
function deletionWarning(
  option: ProductCustomOption | null,
  productCount: number,
): string {
  if (!option) return "";

  const scope =
    productCount > 0
      ? `${productCount} ${productCount === 1 ? "product offers" : "products offer"} it.`
      : "No product currently offers it.";

  return `“${option.label}” will be removed from every product in this workspace, and the assistant will stop offering it. ${scope} Orders already placed keep what the customer asked for.`;
}

/** How a customer answers, what it costs, and whether it must be answered — one row of badges. */
function CustomOptionBadges({
  option,
  className,
}: Readonly<{ option: ProductCustomOption; className?: string }>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge variant="outline" className="text-[10px]">
        {INPUT_TYPE_LABELS[option.inputType]}
      </Badge>
      <Badge
        variant={option.requiresQuote ? "outline" : "secondary"}
        className="text-[10px]"
      >
        {describeSurcharge(option)}
      </Badge>
      {option.isRequired && (
        <Badge variant="secondary" className="text-[10px]">
          Must answer
        </Badge>
      )}
      {!option.isActive && (
        <Badge variant="outline" className="text-[10px]">
          Switched off
        </Badge>
      )}
    </div>
  );
}

function CustomOptionRow({
  option,
  isOffered,
  onOfferedChange,
  onEdit,
  onDelete,
  disabled,
}: Readonly<{
  option: ProductCustomOption;
  isOffered: boolean;
  onOfferedChange: (isOffered: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}>) {
  return (
    <li className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition">
      <Checkbox
        checked={isOffered}
        disabled={disabled || !option.isActive}
        onCheckedChange={(checked) => onOfferedChange(checked === true)}
        aria-label={`Offer "${option.label}" on this product`}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm">{option.label}</p>
        <CustomOptionBadges option={option} className="mt-1" />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Edit ${option.label}`}
        onClick={onEdit}
        disabled={disabled}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${option.label}`}
        onClick={onDelete}
        disabled={disabled}
      >
        <Trash2 className="text-destructive size-4" />
      </Button>
    </li>
  );
}
