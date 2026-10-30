'use client';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface InstructionListFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  addLabel: string;
  emptyHint: string;
  maxItems?: number;
  maxLength?: number;
  disabled?: boolean;
  /** Renders the label at the same weight as a regular form label, for fields that head their own block. */
  isLabelProminent?: boolean;
  /** While the list is empty, the add button sits centered inside the empty-state box instead of below it. */
  isAddButtonCentered?: boolean;
}

/** A list of free-text instructions where each entry gets its own multi-line box, because an
 * instruction is a sentence or two — the single-line input of EditableListField would hide it. */
export function InstructionListField({
  label,
  values,
  onChange,
  placeholder,
  addLabel,
  emptyHint,
  maxItems = 20,
  maxLength = 600,
  disabled = false,
  isLabelProminent = false,
  isAddButtonCentered = false,
}: InstructionListFieldProps) {
  const isAtLimit = values.length >= maxItems;
  const isAddButtonInsideEmptyState = isAddButtonCentered && values.length === 0;
  const listRef = useRef<HTMLOListElement>(null);
  const previousCount = useRef(values.length);

  // Keeps a freshly added box in view once the list is tall enough to scroll.
  useEffect(() => {
    const list = listRef.current;
    if (list && values.length > previousCount.current) list.scrollTo({ top: list.scrollHeight });
    previousCount.current = values.length;
  }, [values.length]);

  function updateValueAt(index: number, nextValue: string) {
    onChange(values.map((value, i) => (i === index ? nextValue : value)));
  }

  function removeValueAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  const addButton = (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={isAddButtonInsideEmptyState ? undefined : 'self-start'}
      disabled={disabled || isAtLimit}
      onClick={() => onChange([...values, ''])}
    >
      <Plus size={13} className="mr-1.5" />
      {addLabel}
    </Button>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          className={
            isLabelProminent
              ? 'text-sm font-medium text-[var(--ink)]'
              : 'text-xs font-medium text-[var(--ink-soft)]'
          }
        >
          {label}
        </label>
        <span className="text-[11px] text-[var(--ink-mute)]">
          {values.length} / {maxItems}
        </span>
      </div>

      {values.length === 0 ? (
        <div
          className={`flex flex-col items-center gap-3 rounded-lg border border-dashed border-[var(--line)] px-3 ${
            isAddButtonInsideEmptyState ? 'py-5' : 'py-3'
          }`}
        >
          <p className="text-center text-[11px] text-[var(--ink-mute)]">{emptyHint}</p>
          {isAddButtonInsideEmptyState && addButton}
        </div>
      ) : (
        <ol ref={listRef} className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {values.map((value, index) => (
            <li key={index} className="flex items-start gap-1.5">
              <span className="mt-2 w-5 shrink-0 text-right text-[11px] text-[var(--ink-mute)]">
                {index + 1}.
              </span>
              <Textarea
                className="min-h-[76px] flex-1 resize-y text-[13px]"
                rows={3}
                maxLength={maxLength}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                aria-label={`${label} ${index + 1}`}
                onChange={(event) => updateValueAt(index, event.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                className="mt-1 shrink-0 text-[var(--ink-mute)] hover:text-destructive"
                disabled={disabled}
                onClick={() => removeValueAt(index)}
              >
                <Trash2 size={13} />
              </Button>
            </li>
          ))}
        </ol>
      )}

      {!isAddButtonInsideEmptyState && addButton}
    </div>
  );
}
