"use client";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

export function DefaultAccountButton({
  isDefault,
  isLoading = false,
  disabled,
  onMakeDefault,
}: {
  isDefault: boolean;
  /** Spinner while the default change saves. */
  isLoading?: boolean;
  disabled?: boolean;
  onMakeDefault: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || isDefault || isLoading}
      aria-busy={isLoading}
      onClick={onMakeDefault}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
        isDefault
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--line)] text-[var(--ink-mute)] hover:border-[var(--accent)] hover:text-[var(--ink)]",
      )}
    >
      {isLoading ? (
        <>
          <Loader2 size={11} className="animate-spin" /> Saving…
        </>
      ) : isDefault ? (
        <>
          <Check size={11} /> Default
        </>
      ) : (
        "Make default"
      )}
    </button>
  );
}
