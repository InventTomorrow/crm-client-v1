"use client";
import { useUnreadCount } from "@/features/notifications/hooks/useNotifications";
import { useAppStore } from "@/lib/appStore";
import { useAppEvents } from "@/shared/hooks/useAppEvents";
import { useBrowserFullscreen } from "@/shared/hooks/useBrowserFullscreen";
import { HeaderIconButton } from "@/shared/ui/HeaderIconButton";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { WAConnectDialog, WAStatusButton } from "@/shared/ui/WAConnectDialog";
import {
  Bell,
  Maximize,
  Menu,
  Minimize,
  PanelLeft,
  Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ChatsDropdown } from "./ChatsDropdown";
import { NotificationsPanel } from "./NotificationsPanel";
import { SearchPalette } from "./SearchPalette";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Unified Inbox",
  "/leads": "Leads",
  "/orders": "Orders",
  "/inventory": "Inventory",
  "/admin": "Team & Access",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

interface AppTopBarProps {
  onMobileMenu: () => void;
}

export function AppTopBar({ onMobileMenu }: AppTopBarProps) {
  const pathname = usePathname();

  const { workspaces, currentWorkspaceId, toggleSidebar } = useAppStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  // The app's single SSE subscription — WA status, notifications,
  // conversations and typing all arrive over this one connection.
  useAppEvents();

  const { isFullscreen, toggleFullscreen } = useBrowserFullscreen();
  const { data: unread = 0 } = useUnreadCount();
  const ws =
    workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];
  const title =
    Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ??
    "AsaanRabta";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-1.5 border-b border-[var(--line)] bg-[var(--surface)] px-2.5 sm:gap-2.5 sm:px-[18px]">
      <HeaderIconButton
        label="Open menu"
        className="show-mobile-only"
        onClick={onMobileMenu}
      >
        <Menu size={18} />
      </HeaderIconButton>

      {/* Desktop sidebar collapse toggle */}
      <HeaderIconButton
        label="Toggle sidebar"
        className="hide-mobile"
        onClick={toggleSidebar}
      >
        <PanelLeft size={18} />
      </HeaderIconButton>

      <div className="ml-1 min-w-0">
        <h3 className="truncate text-[14px] font-semibold sm:text-[15px]">
          {title}
        </h3>
        <div className="hide-mobile flex items-center gap-1.5 truncate text-[11px] text-[var(--ink-mute)]">
          <span className="truncate">{ws?.name ?? "AsaanRabta Boutique"}</span>
          <span>·</span>
          <span className="whitespace-nowrap">{ws?.plan ?? "Tier 3"}</span>
        </div>
      </div>
      <div className="min-w-2 flex-1" />

      {/* Desktop search */}
      <Button
        onClick={() => setSearchOpen(true)}
        className="hide-mobile topbar-search-btn mr-1 flex min-w-[280px] cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-[7px] text-[12.5px] text-[var(--ink-mute)]"
      >
        <Search size={13} />
        <span className="flex-1 text-left">
          Search leads, products, orders...
        </span>
        <span className="rounded border border-[var(--line)] px-[5px] py-px font-[var(--font-mono)] text-[10.5px]">
          ⌘K
        </span>
      </Button>

      {/* Mobile search */}
      <HeaderIconButton
        label="Search"
        className="show-mobile-only"
        onClick={() => setSearchOpen(true)}
      >
        <Search size={17} />
      </HeaderIconButton>

      {/* Recent chats — jumps into the unified inbox */}
      <ChatsDropdown />

      {/* WhatsApp status — only for members allowed to manage the connection */}
      <PermissionGuard permission="channels:connect">
        <WAStatusButton onClick={() => setWaOpen(true)} />
        <WAConnectDialog open={waOpen} onOpenChange={setWaOpen} />
      </PermissionGuard>

      {/* Full screen toggle — desktop only */}
      <HeaderIconButton
        label={isFullscreen ? "Exit full screen" : "Full screen view"}
        className="hide-mobile"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
      </HeaderIconButton>

      {/* Notifications */}
      <Popover open={notifOpen} onOpenChange={setNotifOpen}>
        <PopoverTrigger asChild>
          <HeaderIconButton label="Notifications" badgeCount={unread}>
            <Bell size={18} />
          </HeaderIconButton>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-[360px] gap-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-0"
        >
          <NotificationsPanel onClose={() => setNotifOpen(false)} />
        </PopoverContent>
      </Popover>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
