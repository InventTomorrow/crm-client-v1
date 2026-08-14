'use client';
import {
  CreateableAutoComplete,
  type CreateableOption,
} from '@/shared/ui/CreateableAutoComplete';
import { useServiceCategories } from '../hooks/useServices';

interface ServiceCategoryAutocompleteProps {
  value: string;
  onChange: (category: string) => void;
  disabled?: boolean;
}

/** Category is free text on the API, so this suggests what's already in the catalog while still
 * letting a new one be typed — which keeps spellings consistent without locking the list. */
export function ServiceCategoryAutocomplete({
  value,
  onChange,
  disabled,
}: ServiceCategoryAutocompleteProps) {
  const { data: existingCategories = [] } = useServiceCategories();

  const options: CreateableOption[] = existingCategories.map((category) => ({
    id: category,
    label: category,
  }));

  const selected: CreateableOption | null = value ? { id: value, label: value } : null;

  return (
    <CreateableAutoComplete
      items={options}
      selected={selected}
      onSelect={(option) => onChange(option.label)}
      onCreate={(label) => {
        const category = label.trim();
        onChange(category);
        return { id: category, label: category };
      }}
      placeholder="e.g. Social Media, SEO, Branding"
      emptyLabel="No categories yet — type to add one."
      disabled={disabled}
    />
  );
}
