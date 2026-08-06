'use client';
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from '@/shared/ui/AutoComplete';
import { useMemo, useState } from 'react';

interface EnumOption<TValue extends string> {
  id: TValue;
  label: string;
}

interface EnumAutocompleteProps<TValue extends string> {
  /** The allowed values, in the order they should be listed. */
  options: readonly TValue[];
  labels: Record<TValue, string>;
  value: TValue | undefined;
  onChange: (value: TValue) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Searchable picker over a fixed set of values. Unlike CreateableAutoComplete nothing new can be
 * added — the value must stay one the API accepts — so a query that matches nothing selects
 * nothing and the field falls back to the last valid choice on blur. */
export function EnumAutocomplete<TValue extends string>({
  options,
  labels,
  value,
  onChange,
  placeholder = 'Select…',
  emptyLabel = 'No matches',
  disabled,
  className,
}: EnumAutocompleteProps<TValue>) {
  const allOptions = useMemo<EnumOption<TValue>[]>(
    () => options.map((option) => ({ id: option, label: labels[option] })),
    [options, labels],
  );

  const selected = useMemo(
    () => allOptions.find((option) => option.id === value) ?? null,
    [allOptions, value],
  );

  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);

  // Re-sync the visible text when the value changes from outside (a form.reset in edit mode).
  // Adjusting during render rather than in an effect avoids a frame showing the stale label.
  const [lastSelectedId, setLastSelectedId] = useState(selected?.id);
  if (selected?.id !== lastSelectedId) {
    setLastSelectedId(selected?.id);
    setQuery(selected?.label ?? '');
  }

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allOptions;
    return allOptions.filter((option) => option.label.toLowerCase().includes(trimmed));
  }, [query, allOptions]);

  const handleSelect = (option: EnumOption<TValue>) => {
    onChange(option.id);
    setQuery(option.label);
    setOpen(false);
  };

  return (
    <Autocomplete
      items={filteredOptions}
      value={query}
      onValueChange={setQuery}
      itemToStringValue={(item: unknown) => (item as EnumOption<TValue>).label}
      disabled={disabled}
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        setOpen(nextOpen);
        // Typing a non-match then clicking away must not leave the box showing text
        // that isn't the selected value.
        if (!nextOpen) setQuery(selected?.label ?? '');
      }}
      openOnInputClick
    >
      <AutocompleteInput
        placeholder={placeholder}
        className={className ?? 'w-full'}
        showTrigger
        onFocus={() => setOpen(true)}
      />
      <AutocompleteContent sideOffset={4}>
        {filteredOptions.length === 0 && <AutocompleteEmpty>{emptyLabel}</AutocompleteEmpty>}
        <AutocompleteList>
          {(item: EnumOption<TValue>) => (
            <AutocompleteItem key={item.id} value={item} onClick={() => handleSelect(item)}>
              {item.label}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
