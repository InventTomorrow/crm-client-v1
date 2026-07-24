'use client';
import { useMemo } from 'react';
import { CreateableAutoComplete, type CreateableOption } from '@/shared/ui/CreateableAutoComplete';
import { MENU_CATEGORY_SUGGESTIONS } from '../data/menuSeedSuggestions';
import { useCreateMenuCategory, useMenuCategories } from '../hooks/useMenuCategories';

const SUGGESTED_PREFIX = '__suggested__:';

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
  const { mutateAsync: createCategory } = useCreateMenuCategory();

  // Stable option identities across re-renders — CreateableAutoComplete resets its
  // input text whenever the `selected` object reference changes, so a fresh array
  // on every render would fight the user mid-keystroke.
  const options: CreateableOption[] = useMemo(() => {
    const real = categories.map((category) => ({ id: category.id, label: category.name }));
    const realNames = new Set(real.map((option) => option.label.toLowerCase()));
    // Default suggestions (from a sample restaurant menu) for categories not yet created —
    // picking one creates it, exactly like the "Create …" row.
    const suggested = MENU_CATEGORY_SUGGESTIONS.filter((name) => !realNames.has(name.toLowerCase())).map(
      (name) => ({ id: `${SUGGESTED_PREFIX}${name}`, label: name }),
    );
    return [...real, ...suggested];
  }, [categories]);

  const selected = useMemo(
    () => options.find((option) => option.id === categoryId) ?? null,
    [options, categoryId],
  );

  const handleSelect = async (option: CreateableOption) => {
    if (!option.id.startsWith(SUGGESTED_PREFIX)) {
      onChange(option.id);
      return;
    }
    const created = await createCategory({ name: option.label });
    onChange(created.id);
  };

  return (
    <CreateableAutoComplete
      items={options}
      selected={selected}
      onSelect={handleSelect}
      onCreate={async (name) => {
        const created = await createCategory({ name });
        return { id: created.id, label: created.name };
      }}
      placeholder="Select or create a category…"
      emptyLabel="No categories yet"
      disabled={disabled}
    />
  );
}
