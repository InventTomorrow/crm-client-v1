'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

/** Rows past this count scroll instead of stretching the section — one row is 40px tall
 * plus the 8px gap between rows. */
const MAX_VISIBLE_ROWS = 6;
const ROW_HEIGHT_PX = 40;
const ROW_GAP_PX = 8;
const MAX_LIST_HEIGHT_PX = MAX_VISIBLE_ROWS * ROW_HEIGHT_PX + (MAX_VISIBLE_ROWS - 1) * ROW_GAP_PX;

interface EditableListFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  addLabel: string;
  emptyHint: string;
  disabled?: boolean;
  showOrderHandle?: boolean;
  /** Renders the label at the same weight as a regular form label, for fields that head their own block. */
  isLabelProminent?: boolean;
  /** While the list is empty, the add button sits centered inside the empty-state box instead of below it. */
  isAddButtonCentered?: boolean;
}

/** A list of strings where every entry stays an editable input rather than becoming a static
 * chip — the point is that a feature can be corrected later without deleting and retyping it. */
export function EditableListField({
  label,
  values,
  onChange,
  placeholder,
  addLabel,
  emptyHint,
  disabled = false,
  showOrderHandle = false,
  isLabelProminent = false,
  isAddButtonCentered = false,
}: EditableListFieldProps) {
  const isAddButtonInsideEmptyState = isAddButtonCentered && values.length === 0;

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
      disabled={disabled}
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
        {values.length > 0 && (
          <span className="text-[11px] text-[var(--ink-mute)]">{values.length}</span>
        )}
      </div>

      {values.length === 0 ? (
        <div
          className={cn(
            'flex flex-col items-center gap-3 rounded-lg border border-dashed border-[var(--line)] px-3',
            isAddButtonInsideEmptyState ? 'py-5' : 'py-3',
          )}
        >
          <p className="text-center text-[11px] text-[var(--ink-mute)]">{emptyHint}</p>
          {isAddButtonInsideEmptyState && addButton}
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col gap-2',
            values.length > MAX_VISIBLE_ROWS && 'scroll-themed overflow-y-auto pr-1.5',
          )}
          style={
            values.length > MAX_VISIBLE_ROWS ? { maxHeight: `${MAX_LIST_HEIGHT_PX}px` } : undefined
          }
        >
          {values.map((value, index) => (
            <div key={index} className="flex shrink-0 items-center gap-1.5">
              {showOrderHandle && (
                <GripVertical size={13} className="shrink-0 text-[var(--ink-mute)]" />
              )}
              <Input
                className="flex-1"
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e) => updateValueAt(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                className="shrink-0 text-[var(--ink-mute)] hover:text-destructive"
                disabled={disabled}
                onClick={() => removeValueAt(index)}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!isAddButtonInsideEmptyState && addButton}
    </div>
  );
}
