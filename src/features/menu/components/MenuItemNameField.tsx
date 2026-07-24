'use client';
import { useEffect, useMemo, useState } from 'react';
import { CreateableAutoComplete, type CreateableOption } from '@/shared/ui/CreateableAutoComplete';
import { MENU_DISH_NAME_SUGGESTIONS } from '../data/menuSeedSuggestions';
import { useMenuItems } from '../hooks/useMenuItems';

const SEARCH_DEBOUNCE_MS = 300;

/** Dish name field, styled and behaving like MenuCategoryPicker/MenuItemTagPicker:
 * pick an existing dish name from suggestions, or "Create <name>" to use a new one.
 * Unlike category/tag, "creating" here never hits the server — it just adopts the
 * typed text as the id/label pair, since a dish name isn't a separate entity.
 * Suggestions (both live existing dishes and the default seed list) depend on
 * whichever category is currently selected. */
export function MenuItemNameField({
  value,
  onChange,
  categoryId,
  categoryName,
  disabled,
  excludeMenuItemId,
}: {
  value: string;
  onChange: (name: string) => void;
  categoryId?: string;
  categoryName?: string;
  disabled?: boolean;
  excludeMenuItemId?: string;
}) {
  const [debouncedQuery, setDebouncedQuery] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const { data } = useMenuItems(
    {
      search: debouncedQuery.trim() || undefined,
      categoryId: categoryId || undefined,
    },
    // No category selected yet — nothing to scope suggestions to, so skip the fetch
    // entirely rather than showing dishes from every category.
    { enabled: !!categoryId },
  );

  const options: CreateableOption[] = useMemo(() => {
    if (!categoryId) return [];
    const items = data?.pages[0] ?? [];
    const real = items
      .filter((item) => item.id !== excludeMenuItemId)
      .map((item) => ({ id: item.id, label: item.name }));
    const realNames = new Set(real.map((option) => option.label.toLowerCase()));

    const seeded = (categoryName && MENU_DISH_NAME_SUGGESTIONS[categoryName]) || [];
    const suggested = seeded
      .filter((name) => !realNames.has(name.toLowerCase()))
      .map((name) => ({ id: `__suggested__:${name}`, label: name }));

    return [...real, ...suggested];
  }, [data, excludeMenuItemId, categoryName, categoryId]);

  const selected: CreateableOption | null = useMemo(() => {
    if (!value.trim()) return null;
    return (
      options.find((o) => o.label.toLowerCase() === value.trim().toLowerCase()) ?? {
        id: value,
        label: value,
      }
    );
  }, [options, value]);

  return (
    <CreateableAutoComplete
      items={options}
      selected={selected}
      onSelect={(option) => onChange(option.label)}
      onCreate={(name) => ({ id: name, label: name })}
      onQueryChange={onChange}
      placeholder={categoryId ? 'Chicken Karahi' : 'Select a category first…'}
      emptyLabel="No matching dishes"
      disabled={disabled}
    />
  );
}
