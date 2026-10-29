"use client";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

export interface ViewTabOption<TValue extends string> {
  id: TValue;
  label: string;
  Icon?: ElementType;
  className?: string;
}

interface ViewTabsProps<TValue extends string> {
  value: TValue;
  onValueChange: (nextValue: TValue) => void;
  options: readonly ViewTabOption<TValue>[];
  ariaLabel: string;
  className?: string;
}

/** Sharp segmented tabs for switching a page's view (table/calendar, grid/list, active/archived). */
export function ViewTabs<TValue extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
}: ViewTabsProps<TValue>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-10 items-center border border-[var(--line)] bg-[var(--surface-2)]",
        className,
      )}
    >
      {options.map(({ id, label, Icon, className: optionClassName }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onValueChange(id)}
          className={cn(
            "flex h-full items-center gap-1.5 border-b-2 px-3.5 text-[12.5px] font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
            value === id
              ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--ink)]"
              : "border-transparent text-[var(--ink-mute)] hover:text-[var(--ink)]",
            optionClassName,
          )}
        >
          {Icon && <Icon size={13} />}
          {label}
        </button>
      ))}
    </div>
  );
}
