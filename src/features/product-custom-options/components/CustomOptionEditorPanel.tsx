"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/Collapsible";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";
import type { useCustomOptionEditor } from "../hooks/useCustomOptionEditor";
import {
  ANSWER_TYPE_LABELS,
  ANSWER_TYPES,
  isChoiceType,
  PRICING_MODE_LABELS,
  PRICING_MODES,
  type ProductCustomOption,
} from "../types";

/** One field's validation message, styled like the shadcn FormMessage. */
function FieldError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}

/**
 * The add/edit form for one custom option.
 *
 * Four decisions are visible — what to ask, how they answer, what it costs,
 * whether it is compulsory. Everything else lives under "More settings",
 * because a seller adding "Engraving text" should not have to think about
 * stock behaviour to save it.
 *
 * Deliberately not a react-hook-form: this edits a shared pool record, not the
 * product form it is rendered inside, and nesting a form inside the product's
 * own form would submit both.
 */
export function CustomOptionEditorPanel({
  editor,
  onSaved,
}: Readonly<{
  editor: ReturnType<typeof useCustomOptionEditor>;
  /** Called with the saved option, so a caller can tick a newly added one. */
  onSaved?: (option: ProductCustomOption) => void;
}>) {
  const { draft, draftErrors, patchDraft } = editor;
  const [showMore, setShowMore] = useState(false);
  const showsChoices = isChoiceType(draft.inputType);

  const setChoice = (index: number, patch: Partial<(typeof draft.choices)[number]>) => {
    patchDraft({
      choices: draft.choices.map((choice, i) =>
        i === index ? { ...choice, ...patch } : choice,
      ),
    });
  };

  return (
    <div className="mt-3 space-y-5 rounded-lg border p-4">
      <div className="space-y-1.5">
        <Label>What should we ask the customer?</Label>
        <Input
          autoFocus
          value={draft.label}
          onChange={(event) => patchDraft({ label: event.target.value })}
          placeholder="e.g. Custom size"
          disabled={editor.isSubmitting}
        />
        <FieldError message={draftErrors.label} />
      </div>

      <div className="space-y-1.5">
        <Label>How do they answer?</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ANSWER_TYPES.map((type) => (
            <OptionCard
              key={type}
              label={ANSWER_TYPE_LABELS[type].label}
              hint={ANSWER_TYPE_LABELS[type].hint}
              selected={editor.answerType === type}
              onSelect={() => editor.setAnswerType(type)}
              disabled={editor.isSubmitting}
            />
          ))}
        </div>
      </div>

      {showsChoices && (
        <div className="space-y-2">
          <Label>What can they choose from?</Label>
          <p className="text-muted-foreground text-xs">
            The answers you accept for “{draft.label.trim() || "this question"}”
            — one per line. The assistant offers these exactly as written and
            will never invent another.
          </p>
          {draft.choices.map((choice, index) => (
            // Index-keyed deliberately: choices have no id and are reordered by
            // add/remove only, so the index is their identity while editing.
            <div key={index} className="flex items-center gap-2">
              <Input
                value={choice.label}
                onChange={(event) => setChoice(index, { label: event.target.value })}
                placeholder="e.g. Small / Gift wrapped / Blue"
                disabled={editor.isSubmitting}
              />
              {editor.pricingMode === "EXTRA" && (
                <Input
                  type="number"
                  min={0}
                  className="w-32"
                  value={choice.priceDelta}
                  onChange={(event) =>
                    setChoice(index, { priceDelta: Number(event.target.value) })
                  }
                  placeholder="Rs. extra"
                  disabled={editor.isSubmitting}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove choice ${index + 1}`}
                onClick={() =>
                  patchDraft({
                    choices: draft.choices.filter((_, i) => i !== index),
                  })
                }
                disabled={editor.isSubmitting}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patchDraft({
                choices: [
                  ...draft.choices,
                  { label: "", priceDelta: 0, priceAdjustmentType: "FIXED" },
                ],
              })
            }
            disabled={editor.isSubmitting}
          >
            <Plus className="size-4" />
            Add choice
          </Button>
          <FieldError message={draftErrors.choices} />
          <label className="flex items-center gap-2 pt-1">
            <Checkbox
              checked={editor.allowsMultiple}
              onCheckedChange={(checked) =>
                editor.setAllowsMultiple(checked === true)
              }
              disabled={editor.isSubmitting}
            />
            <span className="text-sm">They can pick more than one</span>
          </label>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>What does it cost?</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PRICING_MODES.map((mode) => (
            <OptionCard
              key={mode}
              label={PRICING_MODE_LABELS[mode]}
              hint={PRICING_MODE_HINTS[mode]}
              selected={editor.pricingMode === mode}
              onSelect={() => editor.setPricingMode(mode)}
              disabled={editor.isSubmitting}
            />
          ))}
        </div>
        {editor.pricingMode === "EXTRA" && !showsChoices && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              min={0}
              className="w-40"
              value={draft.priceDelta}
              onChange={(event) =>
                patchDraft({ priceDelta: Number(event.target.value) })
              }
              placeholder="0"
              disabled={editor.isSubmitting}
            />
            <span className="text-muted-foreground text-xs">
              added to the price, per item
            </span>
          </div>
        )}
        <FieldError message={draftErrors.priceDelta} />
      </div>

      <label className="flex items-start gap-3">
        <Switch
          checked={draft.isRequired}
          onCheckedChange={(isRequired) => patchDraft({ isRequired })}
          disabled={editor.isSubmitting}
          className="mt-0.5"
        />
        <span className="min-w-0">
          <span className="block text-sm">Customer must answer this</span>
          <span className="text-muted-foreground block text-xs">
            The order is not placed until they do.
          </span>
        </span>
      </label>

      <Collapsible open={showMore} onOpenChange={setShowMore}>
        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
          <ChevronDown
            className={cn("size-3.5 transition-transform", showMore && "rotate-180")}
          />
          More settings
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-4 border-t pt-3">
          <div className="space-y-1.5">
            <Label>How should the assistant ask?</Label>
            <Textarea
              rows={2}
              value={draft.helpText ?? ""}
              onChange={(event) => patchDraft({ helpText: event.target.value })}
              placeholder="e.g. Ask for the exact wording and read it back to confirm."
              disabled={editor.isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              Not shown to the customer.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Smallest order we accept</Label>
              <Input
                type="number"
                min={1}
                value={draft.minQuantity}
                onChange={(event) =>
                  patchDraft({ minQuantity: Number(event.target.value) })
                }
                disabled={editor.isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Extra days to prepare</Label>
              <Input
                type="number"
                min={0}
                value={draft.leadTimeDays ?? ""}
                onChange={(event) =>
                  patchDraft({
                    leadTimeDays:
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value),
                  })
                }
                placeholder="—"
                disabled={editor.isSubmitting}
              />
            </div>
          </div>

          <label className="flex items-start gap-3">
            <Switch
              checked={!draft.consumesStock}
              onCheckedChange={(madeToOrder) =>
                patchDraft({ consumesStock: !madeToOrder })
              }
              disabled={editor.isSubmitting}
              className="mt-0.5"
            />
            <span className="min-w-0">
              <span className="block text-sm">Made specially, not from stock</span>
              <span className="text-muted-foreground block text-xs">
                Turn on when a new one is made for the customer — your stock count
                stays untouched.
              </span>
            </span>
          </label>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={editor.cancelEditing}
          disabled={editor.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            void editor.submitDraft().then((saved) => {
              if (saved) onSaved?.(saved);
            });
          }}
          disabled={editor.isSubmitting || !editor.isDraftValid}
        >
          {editor.isAdding ? "Add option" : "Save option"}
        </Button>
      </div>
    </div>
  );
}

const PRICING_MODE_HINTS = {
  FREE: "Same price as usual",
  EXTRA: "A fixed amount on top",
  QUOTE: "You price it by hand before the order is confirmed",
} as const;

/** A selectable card — used for both answer type and pricing, so they read alike. */
function OptionCard({
  label,
  hint,
  selected,
  onSelect,
  disabled,
}: Readonly<{
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "rounded-lg border p-3 text-left transition disabled:opacity-50",
        selected
          ? "border-primary bg-primary/5"
          : "hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      <span className="block text-sm font-medium">{label}</span>
      <span className="text-muted-foreground block text-xs">{hint}</span>
    </button>
  );
}
