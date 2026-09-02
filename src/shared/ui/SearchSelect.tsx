"use client";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";

export interface SearchSelectOption {
  label: string;
  value: string;
}

export interface SearchSelectProps {
  options: readonly SearchSelectOption[] | readonly string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  /** Renders a "Create <query>" row so users can commit values not in the list. */
  creatable?: boolean;
  createLabel?: (query: string) => string;
  "aria-invalid"?: boolean;
}

function normalizeOptions(
  options: readonly SearchSelectOption[] | readonly string[],
): SearchSelectOption[] {
  return options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
}

/**
 * Single-select combobox over a static option list, searched from a box inside
 * the dropdown rather than in the trigger — so the chosen value stays readable
 * while typing. Set `creatable` to also accept values not in the list.
 *
 * Distinct from `CreateableAutoComplete`, which is an input the user types
 * directly into; this one reads as a Select and is what form fields with a long
 * fixed list (product category) use.
 */
export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  disabled = false,
  clearable = true,
  className,
  creatable = false,
  createLabel = (query) => `Create "${query}"`,
  "aria-invalid": ariaInvalid,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
  const selected = normalizedOptions.find((option) => option.value === value);
  const label = selected?.label ?? value ?? "";

  const trimmedQuery = query.trim();
  const showCreate =
    creatable &&
    trimmedQuery.length > 0 &&
    !normalizedOptions.some(
      (option) => option.label.toLowerCase() === trimmedQuery.toLowerCase(),
    );

  const commit = (nextValue: string) => {
    onChange(nextValue);
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Styled to match SelectTrigger — same height, border and focus ring —
            so it sits level with Input/Select in a shared form row. */}
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "border-input focus-visible:border-ring focus-visible:ring-ring/50",
            "dark:bg-input/30 dark:hover:bg-input/50",
            // Radix owns the combobox ARIA on the trigger at runtime, so the
            // invalid state is styling only — FormControl already wires the
            // error message to the field for assistive tech.
            ariaInvalid &&
              "border-destructive ring-[3px] ring-destructive/20 dark:ring-destructive/40",
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent",
            "px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow]",
            "outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            !label && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{label || placeholder}</span>
          <span className="text-muted-foreground flex shrink-0 items-center gap-1">
            {clearable && label && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear selection"
                className="opacity-60 transition-opacity hover:opacity-100"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                }}
              >
                <X className="size-4" />
              </span>
            )}
            <ChevronsUpDown className="size-4 opacity-60" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {!showCreate && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            <CommandGroup>
              {normalizedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => commit(option.value)}
                >
                  <Check
                    className={cn(
                      "size-4",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {showCreate && (
                <CommandItem
                  value={trimmedQuery}
                  onSelect={() => commit(trimmedQuery)}
                >
                  <Check className="size-4 opacity-0" />
                  {createLabel(trimmedQuery)}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
