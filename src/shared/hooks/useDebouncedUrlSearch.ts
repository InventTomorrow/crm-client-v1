"use client";
import { useEffect, useRef, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "./useDebouncedValue";
import { useUrlState } from "./useUrlState";

/**
 * A search box bound to a URL param: the input updates instantly, the URL (and any query
 * reading it) only after typing pauses — one router.replace + fetch instead of one per key.
 */
export function useDebouncedUrlSearch(
  key: string,
  delayMs = SEARCH_DEBOUNCE_MS,
) {
  const [urlSearch, setUrlSearch] = useUrlState(key);
  const [inputValue, setInputValue] = useState(urlSearch);
  const [committedSearch, setCommittedSearch] = useState(urlSearch);
  const [previousUrlSearch, setPreviousUrlSearch] = useState(urlSearch);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setUrlSearchRef = useRef(setUrlSearch);

  // The setter changes whenever any other param does; the timer must write with the latest one.
  useEffect(() => {
    setUrlSearchRef.current = setUrlSearch;
  }, [setUrlSearch]);

  useEffect(
    () => () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    },
    [],
  );

  // Back/forward or a link changed the param — only then overwrite what the user is typing.
  if (urlSearch !== previousUrlSearch) {
    setPreviousUrlSearch(urlSearch);
    if (urlSearch !== committedSearch) {
      setCommittedSearch(urlSearch);
      setInputValue(urlSearch);
    }
  }

  const setSearchInput = (nextValue: string) => {
    setInputValue(nextValue);
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      const trimmedValue = nextValue.trim();
      setCommittedSearch(trimmedValue);
      setUrlSearchRef.current(trimmedValue);
    }, delayMs);
  };

  return { searchInput: inputValue, setSearchInput, search: urlSearch };
}
