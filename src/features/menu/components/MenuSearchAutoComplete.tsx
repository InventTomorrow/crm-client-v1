"use client";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/shared/ui/AutoComplete";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Search, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getMenuItems } from "../services/menuService";
import type { MenuCategory } from "../types";

type SuggestionEntry =
  | { kind: "category"; id: string; label: string }
  | { kind: "dish"; id: string; label: string; categoryName: string };

/**
 * Search box for the Menu list, backed by the Autocomplete primitive instead of a
 * plain input. Opening it (focus/click) with no query shows every category as a
 * quick jump-to-category shortcut. Once the customer types something that doesn't
 * match any category, it falls back to a live, debounced lookup over actual dishes —
 * so it behaves like real search instead of a plain category filter.
 */
export function MenuSearchAutoComplete({
  search,
  onSearchChange,
  onFilterCategoryIdChange,
  categories,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onFilterCategoryIdChange: (value: string) => void;
  categories: MenuCategory[];
}) {
  const [query, setQuery] = useState(search);
  const [debouncedQuery, setDebouncedQuery] = useState(search);
  const [open, setOpen] = useState(false);

  // Input stays bound to `query` (updates every keystroke, never lags); the grid
  // filter and the live dish lookup below only react 300ms after typing stops.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    onSearchChange(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // One-way sync: if the search term is cleared externally (the "Clear" link),
  // reflect that locally too.
  useEffect(() => {
    setQuery(search);
  }, [search]);

  const term = query.trim().toLowerCase();
  const matchingCategories = useMemo(
    () =>
      term
        ? categories.filter((c) => c.name.toLowerCase().includes(term))
        : categories,
    [categories, term],
  );

  // Category matching is instant client-side filtering — only fall back to a live
  // API search over dishes once no category matches what was typed.
  const dishSearchEnabled = term.length > 0 && matchingCategories.length === 0;
  const { data: dishMatches = [], isFetching: isSearchingDishes } = useQuery({
    queryKey: ["menu-items", "search-suggest", debouncedQuery],
    queryFn: () => getMenuItems({ search: debouncedQuery, limit: 8 }),
    enabled: dishSearchEnabled && debouncedQuery.length > 0,
  });

  const entries: SuggestionEntry[] = [
    ...matchingCategories.map(
      (c): SuggestionEntry => ({ kind: "category", id: c.id, label: c.name }),
    ),
    ...(dishSearchEnabled
      ? dishMatches.map(
          (item): SuggestionEntry => ({
            kind: "dish",
            id: item.id,
            label: item.name,
            categoryName: item.category.name,
          }),
        )
      : []),
  ];

  const handleSelect = (entry: SuggestionEntry) => {
    if (entry.kind === "category") {
      onFilterCategoryIdChange(entry.id);
      setQuery("");
      setDebouncedQuery("");
    } else {
      setQuery(entry.label);
      setDebouncedQuery(entry.label);
    }
    setOpen(false);
  };

  return (
    <div className="relative flex-1 min-w-[220px] xl:min-w-[320px]">
      <Autocomplete
        items={entries}
        value={query}
        onValueChange={setQuery}
        itemToStringValue={(entry: unknown) => (entry as SuggestionEntry).label}
        open={open}
        onOpenChange={setOpen}
        openOnInputClick
      >
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[var(--ink-mute)]"
        />
        <AutocompleteInput
          placeholder="Search dishes or categories…"
          className="pl-9"
          showClear
          onFocus={() => setOpen(true)}
        />
        <AutocompleteContent>
          {entries.length === 0 && (
            <AutocompleteEmpty>
              {isSearchingDishes ? "Searching…" : "No matches found."}
            </AutocompleteEmpty>
          )}
          <AutocompleteList>
            {(entry: SuggestionEntry) => (
              <AutocompleteItem
                key={entry.id}
                value={entry}
                onClick={() => handleSelect(entry)}
              >
                {entry.kind === "category" ? (
                  <LayoutGrid size={13} className="opacity-60" />
                ) : (
                  <UtensilsCrossed size={13} className="opacity-60" />
                )}
                {entry.label}
                {entry.kind === "dish" && (
                  <span className="ml-auto text-[11px] text-[var(--ink-mute)]">
                    {entry.categoryName}
                  </span>
                )}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  );
}
