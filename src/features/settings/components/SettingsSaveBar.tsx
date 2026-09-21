import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SettingsSaveBarVariant = "card" | "inset";

interface SettingsSaveBarProps {
  children: ReactNode;
  /** `inset` bleeds to the edges of a parent `.card p-[22px]`. */
  variant?: SettingsSaveBarVariant;
  className?: string;
}

// Must render inside the form so it sticks to the settings scroll container while the form is in view.
export function SettingsSaveBar({ children, variant = "card", className }: SettingsSaveBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 py-3 backdrop-blur-md",
        variant === "card"
          ? "card px-4"
          : "-mx-[22px] -mb-[22px] rounded-b-[var(--radius-card)] border-t border-[var(--line)] bg-[var(--surface)]/95 px-[22px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
