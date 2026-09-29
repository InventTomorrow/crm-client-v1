"use client";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shared/ui/HoverCard";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { formatNavBadge } from "./navItems";

interface SidebarNavFlyoutProps {
  href: string;
  label: string;
  badge?: number;
  isActive: boolean;
  onNavigate: () => void;
  childLinks?: ReactNode;
  /** The rail link that opens the flyout on hover or focus. */
  children: ReactNode;
}

export function SidebarNavFlyout({
  href,
  label,
  badge,
  isActive,
  onNavigate,
  childLinks,
  children,
}: SidebarNavFlyoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HoverCard
      open={isOpen}
      onOpenChange={setIsOpen}
      openDelay={60}
      closeDelay={120}
    >
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      {/* Portalled so the nav's overflow clip can't cut it off; any link click inside closes it. */}
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={14}
        onClick={() => setIsOpen(false)}
        className="z-[80] w-56 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 text-[var(--ink)] shadow-[var(--shadow-3)] ring-0 duration-150 ease-out motion-reduce:animate-none"
      >
        <Link
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13.5px] font-semibold no-underline transition-colors hover:bg-[var(--surface-2)]",
            isActive ? "text-[var(--accent)]" : "text-[var(--ink)]",
          )}
        >
          <span className="flex-1 truncate">{label}</span>
          {!!badge && (
            <span className="badge min-w-5 justify-center border-none bg-[var(--accent)] px-[7px] py-[1px] font-medium text-white">
              {formatNavBadge(badge)}
            </span>
          )}
        </Link>

        {childLinks && (
          <div className="mt-1 flex flex-col gap-0.5 border-t border-[var(--line)] pt-1">
            {childLinks}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
