"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Binds a single URL query param to state. Returns the current value (or the
 * default) and a setter that writes it back to the URL via `router.replace`
 * (no scroll, no history spam). Empty values remove the param to keep URLs clean.
 *
 * Filters/tabs/pages live in the URL so views are shareable and survive reloads.
 */
export function useUrlState(
  key: string,
  defaultValue = "",
): [string, (value: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next && next !== defaultValue) params.set(key, next);
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [key, defaultValue, pathname, router, searchParams],
  );

  return [value, setValue];
}
