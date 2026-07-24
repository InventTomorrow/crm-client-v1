"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/shared/ui/AutoComplete";

export interface AutoCompleteSelectOption {
  id: string;
  label: string;
}

export interface AutoCompleteSelectProps<T extends AutoCompleteSelectOption> {
  items: T[];
  /** Currently selected option, or `null` when nothing is selected. */
  selected: T | null;
  onSelect: (item: T | null) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Search-to-select autocomplete for picking one EXISTING option — unlike CreateableAutoComplete,
 * there's no "Create …" row. Opens its suggestions on focus/click, not just once the user types. */
export function AutoCompleteSelect<T extends AutoCompleteSelectOption>({
  items,
  selected,
  onSelect,
  placeholder = "Search…",
  emptyLabel = "No results.",
  disabled,
  className,
}: AutoCompleteSelectProps<T>) {
  const [query, setQuery] = React.useState(selected?.label ?? "");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setQuery(selected?.label ?? "");
  }, [selected]);

  const trimmedQuery = query.trim();
  const filteredItems = React.useMemo(() => {
    if (!trimmedQuery) return items;
    const term = trimmedQuery.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, trimmedQuery]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    if (next === "" && selected) onSelect(null);
  };

  return (
    <Autocomplete
      items={filteredItems}
      value={query}
      onValueChange={handleQueryChange}
      itemToStringValue={(entry: unknown) => (entry as T).label}
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
      openOnInputClick
    >
      <AutocompleteInput
        placeholder={placeholder}
        className={cn(className)}
        showClear
        onFocus={() => setOpen(true)}
      />
      <AutocompleteContent>
        {filteredItems.length === 0 && (
          <AutocompleteEmpty>{emptyLabel}</AutocompleteEmpty>
        )}
        <AutocompleteList>
          {(entry: T) => (
            <AutocompleteItem
              key={entry.id}
              value={entry}
              onClick={() => {
                onSelect(entry);
                setQuery(entry.label);
              }}
            >
              {entry.label}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
