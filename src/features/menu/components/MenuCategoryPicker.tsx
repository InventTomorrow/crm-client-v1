'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from '@/shared/ui/AutoComplete';
import { useCreateMenuCategory, useMenuCategories } from '../hooks/useMenuCategories';
import { MENU_CATEGORY_SUGGESTIONS } from '../data/menuSeedSuggestions';

export interface CategoryOption {
  id: string;
  label: string;
  isSuggested?: boolean;
}

export function MenuCategoryPicker({
  categoryId,
  onChange,
  disabled,
}: {
  categoryId: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
}) {
  const { data: categories = [] } = useMenuCategories();
  const createCategoryMutation = useCreateMenuCategory();
  const [isCreating, setIsCreating] = useState(false);

  const options: CategoryOption[] = useMemo(() => {
    const existingMap = new Map<string, string>();
    const dynamic: CategoryOption[] = categories.map((c) => {
      existingMap.set(c.name.trim().toLowerCase(), c.id);
      return { id: c.id, label: c.name, isSuggested: false };
    });

    const suggestedCategories: CategoryOption[] = [];
    for (const suggestedCategoryName of MENU_CATEGORY_SUGGESTIONS) {
      const lower = suggestedCategoryName.trim().toLowerCase();
      if (!existingMap.has(lower)) {
        suggestedCategories.push({
          id: `__suggested__:${suggestedCategoryName}`,
          label: suggestedCategoryName,
          isSuggested: true,
        });
      }
    }

    return [...dynamic, ...suggestedCategories];
  }, [categories]);

  const selected = useMemo(
    () => options.find((option) => option.id === categoryId) ?? null,
    [options, categoryId],
  );

  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected?.label ?? '');
  }, [selected]);

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((item) => item.label.toLowerCase().includes(trimmed));
  }, [options, query]);

  const handleSelect = async (item: CategoryOption) => {
    if (item.isSuggested || item.id.startsWith('__suggested__:')) {
      try {
        setIsCreating(true);
        const newCategory = await createCategoryMutation.mutateAsync({ name: item.label });
        onChange(newCategory.id);
        setQuery(newCategory.name);
      } finally {
        setIsCreating(false);
        setOpen(false);
      }
    } else {
      onChange(item.id);
      setQuery(item.label);
      setOpen(false);
    }
  };

  const isBusy = disabled || isCreating || createCategoryMutation.isPending;

  return (
    <Autocomplete
      items={filteredItems}
      value={query}
      onValueChange={(val) => setQuery(val)}
      itemToStringValue={(item: unknown) => (item as CategoryOption).label}
      disabled={isBusy}
      open={open}
      onOpenChange={setOpen}
      openOnInputClick
    >
      <AutocompleteInput
        placeholder="Select category…"
        className="w-full"
        showClear
        showTrigger
        onFocus={() => setOpen(true)}
      />
      <AutocompleteContent sideOffset={4}>
        {filteredItems.length === 0 && (
          <AutocompleteEmpty>No matching categories found</AutocompleteEmpty>
        )}
        <AutocompleteList>
          {(item: CategoryOption) => (
            <AutocompleteItem
              key={item.id}
              value={item}
              onClick={() => handleSelect(item)}
            >
              {item.label}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}


