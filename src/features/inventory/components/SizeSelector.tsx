"use client";
import { useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import { getSizeGroupsForCategory } from "../types";

/**
 * Size picker that shows only the size groups relevant to the selected category
 * and highlights chosen sizes in the accent color. Prunes selected sizes that
 * no longer belong to the visible groups when the category changes.
 */
export function SizeSelector({
  category,
  value,
  onChange,
  disabled,
}: {
  category?: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const groups = getSizeGroupsForCategory(category);

  useEffect(() => {
    const valid = new Set<string>(groups.flatMap((g) => [...g.options]));
    const next = (value ?? []).filter((v) => valid.has(v));
    if (next.length !== (value ?? []).length) onChange(next);
    // Prune only when the category (and therefore the visible groups) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div className="flex flex-col gap-2.5">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-[var(--ink-mute)]">
            {group.label}
          </span>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            value={value ?? []}
            onValueChange={onChange}
            disabled={disabled}
            className="flex-wrap justify-start"
          >
            {group.options.map((option) => (
              <ToggleGroupItem
                key={option}
                value={option}
                aria-label={option}
                className="data-[state=on]:bg-[var(--accent)] data-[state=on]:text-white data-[state=on]:border-[var(--accent)] data-[state=on]:hover:bg-[var(--accent)] data-[state=on]:hover:text-white"
              >
                {option}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ))}
    </div>
  );
}
