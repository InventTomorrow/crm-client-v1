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
import {
  ChevronDown,
  CircleCheck,
  CirclePlus,
  Equal,
  ImageIcon,
  ListChecks,
  Loader2,
  MessageSquare,
  Plus,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { CustomOptionEditor } from "../hooks/useCustomOptionEditor";
import {
  ANSWER_TYPE_LABELS,
  ANSWER_TYPES,
  isChoiceType,
  PRICING_MODE_LABELS,
  PRICING_MODES,
  type AnswerType,
  type PricingMode,
  type ProductCustomOption,
} from "../types";

const ANSWER_TYPE_ICONS: Record<AnswerType, LucideIcon> = {
  TEXT: Type,
  CHOICE: ListChecks,
  IMAGE: ImageIcon,
};

const PRICING_MODE_ICONS: Record<PricingMode, LucideIcon> = {
  FREE: Equal,
  EXTRA: CirclePlus,
  QUOTE: MessageSquare,
};

const PRICING_MODE_HINTS: Record<PricingMode, string> = {
  FREE: "Same price as usual",
  EXTRA: "A fixed amount on top",
  QUOTE: "You price it by hand before the order is confirmed",
};

const OPTION_LABEL_INPUT_ID = "custom-option-label";

/** One field's validation message, styled like the shadcn FormMessage. */
function FieldError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}

/**
 * The add/edit form for one custom option, laid out to fill a dialog: the
 * fields scroll, the Cancel/Save row stays pinned.
 *
 * Four decisions are visible — what to ask, how they answer, what it costs,
 * whether it is compulsory. Everything else lives under "More settings",
 * because a seller adding "Engraving text" should not have to think about
 * stock behaviour to save it.
 *
 * Deliberately not a react-hook-form: this edits a shared pool record, not the
 * product form it is opened from, and nesting a form inside the product's own
 * form would submit both.
 */
export function CustomOptionEditorPanel({
  editor,
  onSaved,
}: Readonly<{
  editor: CustomOptionEditor;
  /** Called with the saved option, so a caller can tick a newly added one. */
  onSaved?: (option: ProductCustomOption) => void;
}>) {
  const { draft, draftErrors, patchDraft } = editor;
  const [showMore, setShowMore] = useState(false);
  const showsChoices = isChoiceType(draft.inputType);

  const setChoice = (
    index: number,
    patch: Partial<(typeof draft.choices)[number]>,
  ) => {
    patchDraft({
      choices: draft.choices.map((choice, i) =>
        i === index ? { ...choice, ...patch } : choice,
      ),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scroll min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <EditorSection
          title="What should we ask the customer?"
          htmlFor={OPTION_LABEL_INPUT_ID}
        >
          <Input
            id={OPTION_LABEL_INPUT_ID}
            autoFocus
            value={draft.label}
            onChange={(event) => patchDraft({ label: event.target.value })}
            placeholder="e.g. Custom size"
            disabled={editor.isSubmitting}
          />
          <FieldError message={draftErrors.label} />
        </EditorSection>

        <EditorSection title="How do they answer?">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {ANSWER_TYPES.map((type) => (
              <OptionCard
                key={type}
                icon={ANSWER_TYPE_ICONS[type]}
                label={ANSWER_TYPE_LABELS[type].label}
                hint={ANSWER_TYPE_LABELS[type].hint}
                isSelected={editor.answerType === type}
                onSelect={() => editor.setAnswerType(type)}
                disabled={editor.isSubmitting}
              />
            ))}
          </div>
        </EditorSection>

        {showsChoices && (
          <EditorSection
            title="What can they choose from?"
            hint={`The answers you accept for “${draft.label.trim() || "this question"}” — one per line. The assistant offers these exactly as written and will never invent another.`}
          >
            <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/40 p-3">
              {draft.choices.map((choice, index) => (
                // Index-keyed deliberately: choices have no id and are reordered by
                // add/remove only, so the index is their identity while editing.
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={choice.label}
                    onChange={(event) =>
                      setChoice(index, { label: event.target.value })
                    }
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
                        setChoice(index, {
                          priceDelta: Number(event.target.value),
                        })
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
                    className="shrink-0 text-[var(--ink-mute)] hover:text-destructive"
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
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    patchDraft({
                      choices: [
                        ...draft.choices,
                        {
                          label: "",
                          priceDelta: 0,
                          priceAdjustmentType: "FIXED",
                        },
                      ],
                    })
                  }
                  disabled={editor.isSubmitting}
                >
                  <Plus className="size-4" />
                  Add choice
                </Button>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={editor.allowsMultiple}
                    onCheckedChange={(checked) =>
                      editor.setAllowsMultiple(checked === true)
                    }
                    disabled={editor.isSubmitting}
                  />
                  <span className="text-[13px] text-[var(--ink)]">
                    They can pick more than one
                  </span>
                </label>
              </div>
            </div>
            <FieldError message={draftErrors.choices} />
          </EditorSection>
        )}

        <EditorSection title="What does it cost?">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {PRICING_MODES.map((mode) => (
              <OptionCard
                key={mode}
                icon={PRICING_MODE_ICONS[mode]}
                label={PRICING_MODE_LABELS[mode]}
                hint={PRICING_MODE_HINTS[mode]}
                isSelected={editor.pricingMode === mode}
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
              <span className="text-xs text-[var(--ink-mute)]">
                added to the price, per item
              </span>
            </div>
          )}
          <FieldError message={draftErrors.priceDelta} />
        </EditorSection>

        <SwitchRow
          title="Customer must answer this"
          hint="The order is not placed until they do."
          isChecked={draft.isRequired}
          onCheckedChange={(isRequired) => patchDraft({ isRequired })}
          disabled={editor.isSubmitting}
        />

        <Collapsible open={showMore} onOpenChange={setShowMore}>
          <CollapsibleTrigger className="flex items-center gap-1 text-[13px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                showMore && "rotate-180",
              )}
            />
            More settings
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-4 rounded-lg border border-[var(--line)] p-4">
            <div className="space-y-1.5">
              <Label>How should the assistant ask?</Label>
              <Textarea
                rows={2}
                value={draft.helpText ?? ""}
                onChange={(event) =>
                  patchDraft({ helpText: event.target.value })
                }
                placeholder="e.g. Ask for the exact wording and read it back to confirm."
                disabled={editor.isSubmitting}
              />
              <p className="text-xs text-[var(--ink-mute)]">
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

            <SwitchRow
              title="Made specially, not from stock"
              hint="Turn on when a new one is made for the customer — your stock count stays untouched."
              isChecked={!draft.consumesStock}
              onCheckedChange={(isMadeToOrder) =>
                patchDraft({ consumesStock: !isMadeToOrder })
              }
              disabled={editor.isSubmitting}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex justify-end gap-2 border-t border-[var(--line)] bg-[var(--surface-2)]/40 px-6 py-3.5">
        <Button
          type="button"
          variant="outline"
          onClick={editor.cancelEditing}
          disabled={editor.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            void editor.submitDraft().then((saved) => {
              if (saved) onSaved?.(saved);
            });
          }}
          disabled={editor.isSubmitting || !editor.isDraftValid}
        >
          {editor.isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {editor.isAdding ? "Add option" : "Save option"}
        </Button>
      </div>
    </div>
  );
}

function EditorSection({
  title,
  hint,
  htmlFor,
  children,
}: Readonly<{
  title: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}>) {
  return (
    <section className="space-y-2.5">
      <div className="space-y-0.5">
        <Label
          htmlFor={htmlFor}
          className="text-[13px] font-semibold text-[var(--ink)]"
        >
          {title}
        </Label>
        {hint && <p className="text-xs text-[var(--ink-mute)]">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** A selectable card — used for both answer type and pricing, so they read alike. */
function OptionCard({
  icon: Icon,
  label,
  hint,
  isSelected,
  onSelect,
  disabled,
}: Readonly<{
  icon: LucideIcon;
  label: string;
  hint: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={isSelected}
      className={cn(
        "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors disabled:opacity-50",
        isSelected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
          : "border-[var(--line)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-2)]",
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md",
          isSelected
            ? "bg-[var(--accent)] text-[var(--primary-foreground)]"
            : "bg-[var(--surface-2)] text-[var(--ink-soft)]",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="space-y-0.5 pr-4">
        <span className="block text-[13px] font-medium text-[var(--ink)]">
          {label}
        </span>
        <span className="block text-xs text-[var(--ink-mute)]">{hint}</span>
      </span>
      {isSelected && (
        <CircleCheck className="absolute top-2.5 right-2.5 size-4 text-[var(--accent)]" />
      )}
    </button>
  );
}

/** A labelled switch in its own bordered row, so a yes/no setting reads as one control. */
function SwitchRow({
  title,
  hint,
  isChecked,
  onCheckedChange,
  disabled,
}: Readonly<{
  title: string;
  hint: string;
  isChecked: boolean;
  onCheckedChange: (isChecked: boolean) => void;
  disabled: boolean;
}>) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border border-[var(--line)] p-3">
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-[var(--ink)]">
          {title}
        </span>
        <span className="block text-xs text-[var(--ink-mute)]">{hint}</span>
      </span>
      <Switch
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5 shrink-0"
      />
    </label>
  );
}
