'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from '@/shared/ui/AutoComplete';
import { BROAD_CATEGORIES, BROAD_CATEGORY_LABELS, type BroadCategory } from '../types';

interface FoodTypeOption {
  id: BroadCategory;
  label: string;
}

const FOOD_TYPE_OPTIONS: FoodTypeOption[] = BROAD_CATEGORIES.map((code) => ({
  id: code,
  label: BROAD_CATEGORY_LABELS[code],
}));

export function FoodTypeAutocomplete({
  value,
  onChange,
  disabled,
}: {
  value?: BroadCategory;
  onChange: (value: BroadCategory) => void;
  disabled?: boolean;
}) {
  const selected = useMemo(
    () => FOOD_TYPE_OPTIONS.find((option) => option.id === value) ?? null,
    [value],
  );
  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected?.label ?? '');
  }, [selected]);

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return FOOD_TYPE_OPTIONS;
    return FOOD_TYPE_OPTIONS.filter((option) => option.label.toLowerCase().includes(trimmed));
  }, [query]);

  const handleSelect = (option: FoodTypeOption) => {
    onChange(option.id);
    setQuery(option.label);
    setOpen(false);
  };

  return (
    <Autocomplete
      items={filteredItems}
      value={query}
      onValueChange={setQuery}
      itemToStringValue={(item: unknown) => (item as FoodTypeOption).label}
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
      openOnInputClick
    >
      <AutocompleteInput
        placeholder="Select food type…"
        className="w-full"
        showClear
        showTrigger
        onFocus={() => setOpen(true)}
      />
      <AutocompleteContent sideOffset={4}>
        {filteredItems.length === 0 && (
          <AutocompleteEmpty>No matching food types</AutocompleteEmpty>
        )}
        <AutocompleteList>
          {(item: FoodTypeOption) => (
            <AutocompleteItem key={item.id} value={item} onClick={() => handleSelect(item)}>
              {item.label}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
