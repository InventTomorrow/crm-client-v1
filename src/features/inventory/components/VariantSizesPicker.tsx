"use client";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { ChevronDown } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { orderSizes } from "../utils/variants";
import { SizeSelector } from "./SizeSelector";

type TriggerProps = Omit<ComponentProps<"button">, "value" | "onChange">;

/** A variant's sizes: a field-height trigger listing them, with the full size picker in a popover. */
export function VariantSizesPicker({
  category,
  value,
  onChange,
  customSizeOptions,
  onCustomSizeAdded,
  disabled,
  className,
  ...triggerProps
}: TriggerProps & {
  category?: string;
  value: string[];
  onChange: (sizes: string[]) => void;
  customSizeOptions: readonly string[];
  onCustomSizeAdded: (size: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const sizesSummary = value.join(", ");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title={sizesSummary || undefined}
          className={cn(
            "flex h-10 w-full min-w-0 items-center justify-between gap-1.5 rounded-lg border border-[var(--ink-mute)]/35 bg-[var(--surface-2)] px-2.5 text-left text-base text-[var(--ink-field)] outline-none transition-colors duration-150 hover:border-[var(--ink-mute)]/60 focus-visible:border-[var(--accent)] focus-visible:ring-3 focus-visible:ring-[var(--accent)]/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
            className,
          )}
          {...triggerProps}
        >
          <span className={cn("truncate", !sizesSummary && "text-muted-foreground")}>
            {sizesSummary || "Select"}
          </span>
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <SizeSelector
          category={category}
          value={value}
          onChange={(sizes) => onChange(orderSizes(sizes))}
          disabled={disabled}
          pruneHiddenSizes={false}
          extraSizes={customSizeOptions}
          onCustomSizeAdded={onCustomSizeAdded}
        />
      </PopoverContent>
    </Popover>
  );
}
