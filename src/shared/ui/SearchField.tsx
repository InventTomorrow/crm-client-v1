"use client";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { Input } from "./Input";

interface SearchFieldProps {
  value: string;
  onValueChange: (nextValue: string) => void;
  placeholder?: string;
  /** Wrapper class — width and flex behaviour belong to the caller. */
  className?: string;
  "aria-label"?: string;
}

/** Toolbar search box. Sits on `--surface` so it reads as a control against the page background,
 * which the transparent base Input does not. */
export function SearchField({
  value,
  onValueChange,
  placeholder = "Search…",
  className,
  "aria-label": ariaLabel,
}: SearchFieldProps) {
  return (
    <div
      className={cn("relative min-w-[200px] flex-1 max-w-[400px]", className)}
    >
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
      />
      <Input
        className="bg-[var(--surface)] pl-9 pr-9 dark:bg-[var(--surface)]"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {value.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange("")}
          className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
