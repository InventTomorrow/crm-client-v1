"use client";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { ComponentProps } from "react";
import { isValidJson } from "../utils/json";

export function PayloadEditor({
  value,
  onChange,
  className,
  ...textareaProps
}: Omit<ComponentProps<"textarea">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const isJsonValid = isValidJson(value);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-[var(--line)] transition-colors focus-within:border-[var(--accent)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--ink-mute)]">
          json
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isJsonValid ? "text-success" : "text-destructive",
          )}
        >
          {isJsonValid ? <Check size={13} /> : <X size={13} />}
          {isJsonValid ? "Valid JSON" : "Invalid JSON"}
        </span>
      </div>
      <textarea
        {...textareaProps}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={18}
        className="w-full resize-y bg-[var(--surface)] p-4 font-mono text-[13px] leading-relaxed text-[var(--ink)] outline-none"
      />
    </div>
  );
}
