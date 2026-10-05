"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
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
  /** Adds a labelled row at the top of the list that clears the selection — clearer than the trigger's small ×. */
  clearOptionLabel?: string;
  /** Adds a footer button that opens an input for a value not in the list. */
  customValueLabel?: string;
  customValuePlaceholder?: string;
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
  clearOptionLabel,
  customValueLabel,
  customValuePlaceholder,
  className,
  creatable = false,
  createLabel = (query) => `Create "${query}"`,
  "aria-invalid": ariaInvalid,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isAddingCustomValue, setIsAddingCustomValue] = useState(false);
  const [customValue, setCustomValue] = useState("");

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

  const closeCustomValueInput = () => {
    setIsAddingCustomValue(false);
    setCustomValue("");
  };

  const commit = (nextValue: string) => {
    onChange(nextValue);
    setQuery("");
    closeCustomValueInput();
    setOpen(false);
  };

  // A typed "xl" reuses the listed "XL", so the same value never exists twice in two spellings.
  const commitCustomValue = () => {
    const typedValue = customValue.trim();
    if (!typedValue) return;
    const listedOption = normalizedOptions.find(
      (option) => option.label.toLowerCase() === typedValue.toLowerCase(),
    );
    commit(listedOption?.value ?? typedValue);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) closeCustomValueInput();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
              {clearOptionLabel && value && !disabled && (
                <CommandItem
                  value={clearOptionLabel}
                  onSelect={() => commit("")}
                  className="text-muted-foreground"
                >
                  <X className="size-4" />
                  {clearOptionLabel}
                </CommandItem>
              )}
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
        {/* Outside <Command>, so cmdk's list keyboard handling never swallows the input's keys. */}
        {customValueLabel && (
          <div className="border-t p-1">
            {isAddingCustomValue ? (
              <div className="flex items-center gap-1.5 p-1">
                <Input
                  autoFocus
                  className="h-8"
                  placeholder={customValuePlaceholder}
                  value={customValue}
                  onChange={(event) => setCustomValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    // Inside a form, Enter would otherwise submit it.
                    event.preventDefault();
                    commitCustomValue();
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={commitCustomValue}
                  disabled={!customValue.trim()}
                  title={customValueLabel}
                  aria-label={customValueLabel}
                >
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsAddingCustomValue(true)}
              >
                <Plus className="size-4" />
                {customValueLabel}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
