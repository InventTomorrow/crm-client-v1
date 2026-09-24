"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Full-screen on phones; a floating right-docked panel from `sm` up. Override the width with `sm:w-[…]`.
export function DetailPanel({
  onClose,
  className,
  children,
}: {
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className={cn(
          "card-2 fade-up fixed z-[70] flex flex-col overflow-hidden bg-[var(--surface)]",
          "max-sm:inset-0 max-sm:rounded-none max-sm:border-0 max-sm:pb-[env(safe-area-inset-bottom)]",
          "sm:top-[14px] sm:right-[14px] sm:bottom-[14px] sm:w-[460px] sm:max-w-[calc(100vw-28px)]",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}
