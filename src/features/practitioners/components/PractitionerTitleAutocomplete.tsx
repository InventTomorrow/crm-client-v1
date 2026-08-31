"use client";
import {
  CreateableAutoComplete,
  type CreateableOption,
} from "@/shared/ui/CreateableAutoComplete";

/** The titles a clinic reaches for most; anything else is still typed in full. */
const COMMON_TITLES = [
  "Dr.",
  "Prof. Dr.",
  "Assoc. Prof. Dr.",
  "Asst. Prof. Dr.",
  "Mr.",
  "Ms.",
  "Mrs.",
] as const;

const TITLE_OPTIONS: CreateableOption[] = COMMON_TITLES.map((title) => ({
  id: title,
  label: title,
}));

interface PractitionerTitleAutocompleteProps {
  value: string;
  onChange: (title: string) => void;
  disabled?: boolean;
}

/**
 * Title is free text on the API, so this offers the usual clinical titles while
 * still accepting one that is typed in — which keeps "Dr." from being stored
 * five different ways without locking out the titles this list does not know.
 */
export function PractitionerTitleAutocomplete({
  value,
  onChange,
  disabled,
}: PractitionerTitleAutocompleteProps) {
  const selected: CreateableOption | null = value
    ? { id: value, label: value }
    : null;

  return (
    <CreateableAutoComplete
      items={TITLE_OPTIONS}
      selected={selected}
      onSelect={(option) => onChange(option.label)}
      // Committed as it goes, so a title typed by hand saves without having to
      // click the create row.
      onQueryChange={onChange}
      onCreate={(label) => {
        const title = label.trim();
        onChange(title);
        return { id: title, label: title };
      }}
      placeholder="Dr."
      emptyLabel="No match — keep typing to use your own."
      disabled={disabled}
    />
  );
}
