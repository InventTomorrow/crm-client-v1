import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      // Urdu entries switch the field right-to-left; callers can still pass their own dir.
      dir="auto"
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-[var(--ink-mute)]/35 bg-[var(--surface-2)] px-2.5 py-1 text-base text-[var(--ink-field)] transition-colors duration-150 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-[var(--ink-mute)]/60 focus-visible:border-[var(--accent)] focus-visible:ring-3 focus-visible:ring-[var(--accent)]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 disabled:hover:border-[var(--ink-mute)]/35 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-[var(--surface-2)] dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
