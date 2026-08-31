'use client';
import {
  CreateableAutoComplete,
  type CreateableOption,
} from '@/shared/ui/CreateableAutoComplete';
import { MAJOR_PAKISTANI_CITIES } from '../utils/pakistaniCities';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  disabled?: boolean;
}

const CITY_OPTIONS: CreateableOption[] = MAJOR_PAKISTANI_CITIES.map((city) => ({
  id: city,
  label: city,
}));

/**
 * City picker for a clinic location.
 *
 * Createable rather than a fixed dropdown: coverage matching compares the city
 * on a location against the city on a coverage row, so consistent spelling
 * matters — but a clinic in a town outside the suggestion list must still be
 * able to add itself, and a locked list would simply block it.
 */
export function CityAutocomplete({
  value,
  onChange,
  disabled,
}: CityAutocompleteProps) {
  const selected: CreateableOption | null = value
    ? { id: value, label: value }
    : null;

  return (
    <CreateableAutoComplete
      items={CITY_OPTIONS}
      selected={selected}
      onSelect={(option) => onChange(option.label)}
      onCreate={(label) => {
        const city = label.trim();
        onChange(city);
        return { id: city, label: city };
      }}
      placeholder="Lahore"
      emptyLabel="No match — type to add this city."
      disabled={disabled}
    />
  );
}
