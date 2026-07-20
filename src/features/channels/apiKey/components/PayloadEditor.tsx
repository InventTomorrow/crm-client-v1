"use client";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useMemo } from "react";

export function PayloadEditor({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const isValid = useMemo(() => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, [value]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-[var(--line)] focus-within:border-[var(--accent)] transition-colors",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-1.5">
        <span className="text-[10.5px] font-medium uppercase tracking-wider text-[var(--ink-mute)]">
          json
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            isValid ? "text-[#15803D]" : "text-[#DC2626]",
          )}
        >
          {isValid ? <Check size={12} /> : <X size={12} />}
          {isValid ? "Valid JSON" : "Invalid JSON"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={14}
        className="w-full resize-y bg-[var(--surface)] p-3.5 font-mono text-[12px] leading-relaxed text-[var(--ink)] outline-none"
      />
    </div>
  );
}
