"use client";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Label } from "@/shared/ui/Label";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCustomOptionEditor } from "../hooks/useCustomOptionEditor";
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
 */
export function ProductCustomOptions({
  selectedKeys,
  onSelectedKeysChange,
  disabled,
}: Readonly<{
  selectedKeys: string[];
  onSelectedKeysChange: (keys: string[]) => void;
  disabled: boolean;
}>) {
  const editor = useCustomOptionEditor();

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
            isBeingEdited={editor.editingId === option.id}
          />
        ))}
      </ul>

      {editor.options.length === 0 && !editor.isAdding && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
          Nothing here yet. Add what customers can ask for — a size, a colour, a
          name to print — and the assistant will collect it before ordering.
        </p>
      )}

      {editor.editingId !== null ? (
        <CustomOptionEditorPanel editor={editor} onSaved={handleSaved} />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={editor.startAdding}
          disabled={disabled}
        >
          <Plus className="size-4" />
          Add option
        </Button>
      )}

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

function CustomOptionRow({
  option,
  isOffered,
  onOfferedChange,
  onEdit,
  onDelete,
  disabled,
  isBeingEdited,
}: Readonly<{
  option: ProductCustomOption;
  isOffered: boolean;
  onOfferedChange: (isOffered: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
  isBeingEdited: boolean;
}>) {
  // The panel below is already showing this option; a duplicate row is noise.
  if (isBeingEdited) return null;

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
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
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
