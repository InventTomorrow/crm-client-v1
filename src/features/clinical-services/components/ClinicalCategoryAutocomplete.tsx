"use client";
import {
  CreateableAutoComplete,
  type CreateableOption,
} from "@/shared/ui/CreateableAutoComplete";
import { useClinicalServiceCategories } from "../hooks/useClinicalServices";

interface ClinicalCategoryAutocompleteProps {
  value: string;
  onChange: (category: string) => void;
  disabled?: boolean;
}

/**
 * Category is free text on the API, so this suggests what the catalogue already
 * uses while still allowing a new one — which keeps spellings consistent
 * without locking the list.
 */
export function ClinicalCategoryAutocomplete({
  value,
  onChange,
  disabled,
}: ClinicalCategoryAutocompleteProps) {
  const { data: existingCategories = [] } = useClinicalServiceCategories();

  const options: CreateableOption[] = existingCategories.map((category) => ({
    id: category,
    label: category,
  }));

  const selected: CreateableOption | null = value
    ? { id: value, label: value }
    : null;

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
      placeholder="e.g. Nursing, Physiotherapy, Elderly care"
      emptyLabel="No categories yet — type to add one."
      disabled={disabled}
    />
  );
}
