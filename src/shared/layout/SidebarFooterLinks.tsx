"use client";
import { useReplayWorkspaceTour } from "@/features/tour/hooks/useReplayWorkspaceTour";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/Tooltip";
import { Compass, Handshake, PlayCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface FooterShortcutProps {
  label: string;
  ariaLabel: string;
  Icon: LucideIcon;
  collapsed: boolean;
  href?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

function FooterShortcut({
  label,
  ariaLabel,
  Icon,
  collapsed,
  href,
  isActive = false,
  isDisabled = false,
  onClick,
}: FooterShortcutProps) {
  const shortcutClassName = cn(
    "group/shortcut flex items-center justify-center rounded-lg border font-[inherit] no-underline cursor-pointer transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    collapsed ? "h-9 w-full" : "flex-col gap-1 px-1 py-2",
    isActive
      ? "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[var(--accent)]"
      : "border-[var(--line)] bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
  );

  const shortcutContent = (
    <>
      <Icon
        size={collapsed ? 16 : 15}
        className={cn(
          "shrink-0 transition-transform duration-200 group-hover/shortcut:scale-110",
          isActive ? "text-[var(--accent)]" : "text-[var(--ink-mute)]",
        )}
      />
      {!collapsed && (
        <span className="text-[11px] font-medium leading-none">{label}</span>
      )}
    </>
  );

  const shortcut = href ? (
    <Link
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      className={shortcutClassName}
    >
      {shortcutContent}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={shortcutClassName}
    >
      {shortcutContent}
    </button>
  );

  if (!collapsed) return shortcut;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{shortcut}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {ariaLabel}
      </TooltipContent>
    </Tooltip>
  );
}

interface SidebarFooterLinksProps {
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}

export function SidebarFooterLinks({
  pathname,
  collapsed,
  onNavigate,
}: SidebarFooterLinksProps) {
  const { canReplayTour, replayWorkspaceTour } = useReplayWorkspaceTour();
  const isPathnameUnder = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const startTour = () => {
    replayWorkspaceTour();
    onNavigate();
  };

  return (
    <div className={collapsed ? "flex flex-col gap-1" : "grid grid-cols-3 gap-1.5"}>
      <FooterShortcut
        label="Demo"
        ariaLabel="Watch demo"
        Icon={PlayCircle}
        collapsed={collapsed}
        href="/demo"
        isActive={isPathnameUnder("/demo")}
        onClick={onNavigate}
      />
      <FooterShortcut
        label="Tour"
        ariaLabel="Take a tour"
        Icon={Compass}
        collapsed={collapsed}
        isDisabled={!canReplayTour}
        onClick={startTour}
      />
      <FooterShortcut
        label="Affiliate"
        ariaLabel="Affiliate dashboard"
        Icon={Handshake}
        collapsed={collapsed}
        href="/affiliate"
        isActive={isPathnameUnder("/affiliate")}
        onClick={onNavigate}
      />
    </div>
  );
}
