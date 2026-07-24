"use client"

import * as React from "react"
import { Loader2Icon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/shared/ui/AutoComplete"

export interface CreateableOption {
  id: string
  label: string
}

const CREATE_ENTRY_ID = "__create__"

type ListEntry<T extends CreateableOption> = T | { id: typeof CREATE_ENTRY_ID; label: string }

function isCreateEntry<T extends CreateableOption>(
  entry: ListEntry<T>
): entry is { id: typeof CREATE_ENTRY_ID; label: string } {
  return entry.id === CREATE_ENTRY_ID
}

export interface CreateableAutoCompleteProps<T extends CreateableOption> {
  items: T[]
  /** Currently selected option, or `null` when nothing is selected. */
  selected: T | null
  onSelect: (item: T) => void
  /** Called when the user picks the "Create …" row. Resolve with the newly created option. */
  onCreate: (label: string) => Promise<T> | T
  /** Fires on every keystroke with the raw typed text — for callers that need to
   * track the live query themselves (e.g. re-filtering server-side), since
   * `selected`/`onSelect` alone only update once the user picks a row. */
  onQueryChange?: (query: string) => void
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  className?: string
}

/** Autocomplete that lets the user pick an existing option or create a new one inline — the query is offered as a "Create <query>" row whenever it doesn't exactly match an existing option. Opens its suggestions on focus/click, not just once the user starts typing. */
export function CreateableAutoComplete<T extends CreateableOption>({
  items,
  selected,
  onSelect,
  onCreate,
  onQueryChange,
  placeholder = "Search or create…",
  emptyLabel = "No results.",
  disabled,
  className,
}: CreateableAutoCompleteProps<T>) {
  const [query, setQuery] = React.useState(selected?.label ?? "")
  const [isCreating, setIsCreating] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setQuery(selected?.label ?? "")
  }, [selected])

  const handleQueryChange = (next: string) => {
    setQuery(next)
    onQueryChange?.(next)
  }

  const trimmedQuery = query.trim()
  const filteredItems = React.useMemo(() => {
    if (!trimmedQuery) return items
    const term = trimmedQuery.toLowerCase()
    return items.filter((item) => item.label.toLowerCase().includes(term))
  }, [items, trimmedQuery])

  const hasExactMatch = items.some(
    (item) => item.label.toLowerCase() === trimmedQuery.toLowerCase()
  )
  const canCreate = trimmedQuery.length > 0 && !hasExactMatch

  const listEntries: ListEntry<T>[] = canCreate
    ? [...filteredItems, { id: CREATE_ENTRY_ID, label: trimmedQuery }]
    : filteredItems

  const handleCreate = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const created = await onCreate(trimmedQuery)
      onSelect(created)
      setQuery(created.label)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Autocomplete
      items={listEntries}
      value={query}
      onValueChange={handleQueryChange}
      itemToStringValue={(entry: unknown) => (entry as ListEntry<T>).label}
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
      openOnInputClick
    >
      <AutocompleteInput
        placeholder={placeholder}
        className={className}
        showClear
        onFocus={() => setOpen(true)}
      />
      <AutocompleteContent>
        {filteredItems.length === 0 && !canCreate && (
          <AutocompleteEmpty>{emptyLabel}</AutocompleteEmpty>
        )}
        <AutocompleteList>
          {(entry: ListEntry<T>) =>
            isCreateEntry(entry) ? (
              <AutocompleteItem
                key={entry.id}
                value={entry}
                onClick={handleCreate}
                className="text-[var(--accent)]"
              >
                {isCreating ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <PlusIcon />
                )}
                Create &ldquo;{entry.label}&rdquo;
              </AutocompleteItem>
            ) : (
              <AutocompleteItem
                key={entry.id}
                value={entry}
                onClick={() => {
                  onSelect(entry)
                  setQuery(entry.label)
                }}
              >
                {entry.label}
              </AutocompleteItem>
            )
          }
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}
