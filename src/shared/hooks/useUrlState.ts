"use client";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Binds a single URL query param to state. Returns the current value (or the
 * default) and a setter that writes it back to the URL in place (no scroll, no
 * history spam). Empty values remove the param to keep URLs clean.
 *
 * Filters/tabs/pages live in the URL so views are shareable and survive reloads.
 */
export function useUrlState(
  key: string,
  defaultValue = "",
): [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      // Reads the live URL so several setters fired together (e.g. "Clear") don't overwrite each other.
      const params = new URLSearchParams(window.location.search);
      if (next && next !== defaultValue) params.set(key, next);
      else params.delete(key);
      const queryString = params.toString();
      // Next syncs native history updates into useSearchParams without a server round-trip.
      window.history.replaceState(
        null,
        "",
        queryString
          ? `${window.location.pathname}?${queryString}`
          : window.location.pathname,
      );
    },
    [key, defaultValue],
  );

  return [value, setValue];
}
