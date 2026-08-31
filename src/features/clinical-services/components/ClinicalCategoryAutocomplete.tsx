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
      placeholder="e.g. Cardiology, Physiotherapy, Dermatology"
      emptyLabel="No categories yet — type to add one."
      disabled={disabled}
    />
  );
}
