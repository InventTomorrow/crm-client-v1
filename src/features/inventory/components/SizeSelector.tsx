"use client";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import { Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getSizeGroupsForCategory, SIZE_GROUPS } from "../types";

/** Every size the built-in groups know about, in any category. */
const KNOWN_SIZES = new Set<string>(
  SIZE_GROUPS.flatMap((group) => [...group.options]),
);

/**
 * Size picker: the groups relevant to the selected category, plus anything the
 * seller typed in themselves.
 *
 * A size that belongs to no group is a custom one — "500g", "12 inch", "Large
 * tray" — so it survives a category change, while a size that belongs to a
 * group the category no longer shows is pruned.
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
  const [isAdding, setIsAdding] = useState(false);
  const [newSize, setNewSize] = useState("");

  const selected = value ?? [];
  const visible = new Set<string>(groups.flatMap((group) => [...group.options]));
  const customSizes = selected.filter((size) => !KNOWN_SIZES.has(size));

  useEffect(() => {
    // Drop sizes from groups this category no longer shows; keep custom ones.
    const next = (value ?? []).filter(
      (size) => visible.has(size) || !KNOWN_SIZES.has(size),
    );
    if (next.length !== (value ?? []).length) onChange(next);
    // Prune only when the category (and therefore the visible groups) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const addSize = () => {
    const size = newSize.trim();
    if (!size) return;
    if (!selected.some((existing) => existing.toLowerCase() === size.toLowerCase())) {
      onChange([...selected, size]);
    }
    setNewSize("");
    setIsAdding(false);
  };

  const cancelAdding = () => {
    setNewSize("");
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {groups.map((group) => (
        <SizeGroup
          key={group.label}
          label={group.label}
          options={[...group.options]}
          value={selected}
          onChange={onChange}
          disabled={disabled}
        />
      ))}

      {customSizes.length > 0 && (
        <SizeGroup
          label="Your own"
          options={customSizes}
          value={selected}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {isAdding ? (
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            className="h-8 max-w-[200px]"
            placeholder="e.g. 500g, 12 inch"
            value={newSize}
            disabled={disabled}
            onChange={(event) => setNewSize(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSize();
              }
              if (event.key === "Escape") cancelAdding();
            }}
          />
          <Button
            type="button"
            size="icon"
            className="size-8"
            onClick={addSize}
            disabled={disabled || !newSize.trim()}
            title="Add size"
          >
            <Check size={14} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            onClick={cancelAdding}
            disabled={disabled}
            title="Cancel"
          >
            <X size={14} />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
        >
          <Plus size={14} />
          Add size
        </Button>
      )}
    </div>
  );
}

function SizeGroup({
  label,
  options,
  value,
  onChange,
  disabled,
}: Readonly<{
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-[var(--ink-mute)]">
        {label}
      </span>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="flex-wrap justify-start"
      >
        {options.map((option) => (
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
  );
}
