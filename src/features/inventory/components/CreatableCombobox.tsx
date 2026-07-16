"use client";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/shared/ui/Autocomplete";
import { Check, Plus } from "lucide-react";
import { useMemo } from "react";

/**
 * Autocomplete picker with inline creation. Filtering is done manually so the
 * displayed list and the `items` prop passed to Base UI are always in sync —
 * this ensures mouse-click selection commits the value reliably.
 */
export function CreatableCombobox({
  value,
  onChange,
  options,
  noun,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  /** Singular label used in placeholders / messages, e.g. "cuisine". */
  noun: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const deduped = useMemo(() => {
    const seen = new Set<string>();
    return options.filter((o) => {
      const key = o?.trim().toLowerCase();
      if (!o || !key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [options]);

  const trimmed = value.trim();
  const query = trimmed.toLowerCase();

  // Filter the static list against the current typed query.
  const filtered = useMemo(
    () =>
      query
        ? deduped.filter((o) => o.toLowerCase().includes(query))
        : deduped,
    [deduped, query],
  );

  const hasExactMatch = deduped.some((o) => o.toLowerCase() === query);
  const showCreate = trimmed.length > 0 && !hasExactMatch;

  // The items we pass to Base UI must include everything we render so that
  // clicking any row commits the value through onValueChange.
  const items = useMemo(
    () => (showCreate ? [...filtered, trimmed] : filtered),
    [filtered, showCreate, trimmed],
  );

  return (
    <Autocomplete
      items={items}
      value={value}
      onValueChange={(next) => onChange(next)}
      // Disable Base UI's built-in filtering — we pre-filter `items` ourselves.
      mode="none"
      openOnInputClick
      disabled={disabled}
    >
      <AutocompleteInput
        placeholder={placeholder ?? `Select ${noun}`}
        showTrigger
        showClear
        className="h-10 rounded-lg border-[var(--line)] bg-[var(--surface)] text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:border-[var(--accent)] focus-visible:ring-[var(--accent)]/15 dark:bg-[var(--surface)]"
      />
      <AutocompleteContent className="border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-md">
        <AutocompleteEmpty className="px-2 py-2 text-left text-[12px] text-[var(--ink-mute)]">
          No {noun} found — type to add one.
        </AutocompleteEmpty>
        <AutocompleteList>
          {filtered.map((option) => (
            <AutocompleteItem
              key={option}
              value={option}
              className="text-[13px] data-highlighted:text-[var(--ink)] data-highlighted:before:bg-[var(--accent-soft)]"
            >
              <span className="truncate">{option}</span>
              {option.toLowerCase() === query && (
                <Check size={13} className="ml-auto text-[var(--accent)]" />
              )}
            </AutocompleteItem>
          ))}
          {showCreate && (
            <AutocompleteItem
              key={`__create__${trimmed}`}
              value={trimmed}
              className="text-[13px] data-highlighted:text-[var(--ink)] data-highlighted:before:bg-[var(--accent-soft)]"
            >
              <span className="flex items-center gap-1.5 text-[var(--accent)]">
                <Plus size={13} /> Add &ldquo;{trimmed}&rdquo;
              </span>
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
