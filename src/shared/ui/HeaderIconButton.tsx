"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { Button } from "./Button";

interface HeaderIconButtonProps extends ComponentProps<typeof Button> {
  /** Tooltip + screen-reader label. */
  label: string;
  /** Unread total — shown as a pill, or a plain dot on mobile widths. */
  badgeCount?: number;
  /** Paints the button in the accent colour (e.g. the route is active). */
  isActive?: boolean;
}

/**
 * The single icon-button shape used across the top bar — circular, muted
 * surface, accent on hover/open, with an optional unread badge.
 */
export function HeaderIconButton({
  label,
  badgeCount = 0,
  isActive = false,
  className,
  children,
  ...props
}: HeaderIconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      className={cn(
        "relative size-9 rounded-full border-0 bg-[var(--surface-2)] text-[var(--ink-soft)] transition-colors",
        "hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
        "aria-expanded:bg-[var(--accent-soft)] aria-expanded:text-[var(--accent)]",
        isActive && "bg-[var(--accent-soft)] text-[var(--accent)]",
        className,
      )}
      {...props}
    >
      {children}
      {badgeCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--accent)] px-1 text-[9.5px] font-semibold text-white">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      )}
    </Button>
  );
}
