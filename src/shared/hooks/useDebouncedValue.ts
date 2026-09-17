"use client";
import { useEffect, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 300;

/** Returns `value` only after it has stopped changing for `delayMs`. */
export function useDebouncedValue<TValue>(
  value: TValue,
  delayMs = SEARCH_DEBOUNCE_MS,
): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
