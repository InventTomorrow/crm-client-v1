"use client";
import { useUrlState } from "./useUrlState";

/** A URL param limited to known values — a hand-edited or stale link falls back to the default. */
export function useUrlEnumState<TValue extends string>(
  key: string,
  allowedValues: readonly TValue[],
  defaultValue: TValue,
): [TValue, (value: TValue) => void] {
  const [paramValue, setParamValue] = useUrlState(key, defaultValue);
  const value = allowedValues.find((allowedValue) => allowedValue === paramValue);
  return [value ?? defaultValue, setParamValue];
}
