"use client";
import { CreatableCombobox } from "./CreatableCombobox";

/**
 * Category picker with inline creation. Thin wrapper over {@link CreatableCombobox}
 * so category, cuisine, and spice level all share one autocomplete implementation.
 */
export function CreatableCategorySelect({
  value,
  onChange,
  options,
  disabled,
  placeholder = "Select category",
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <CreatableCombobox
      value={value}
      onChange={onChange}
      options={options}
      noun="category"
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
