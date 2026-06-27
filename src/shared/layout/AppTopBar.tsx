"use client";
import { useWAStatusStream } from "@/features/channels/hooks/useWhatsApp";
import {
  useNotificationStream,
  useUnreadCount,
} from "@/features/notifications/hooks/useNotifications";
import { useAppStore } from "@/lib/appStore";
import { WAConnectDialog, WAStatusButton } from "@/shared/ui/WAConnectDialog";
import { Bell, Maximize2, Menu, Minimize2, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { NotificationsPanel } from "./NotificationsPanel";
import { SearchPalette } from "./SearchPalette";

const TITLES: Record<string, string> = {
  "/inbox": "Unified Inbox",
  "/leads": "Leads",
  "/orders": "Orders",
  "/inventory": "Inventory",
  "/analytics": "Analytics",
  "/admin": "Team & Access",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

interface AppTopBarProps {
  onMobileMenu: () => void;
}

export function AppTopBar({ onMobileMenu }: AppTopBarProps) {
  const pathname = usePathname();

  const {
    workspaces,
    currentWorkspaceId,
    toggleFullScreen,
    isFullScreen,
    toggleSidebar,
  } = useAppStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  // Always-on WA status stream so the header icon updates instantly on connect/disconnect.
  useWAStatusStream();
  // Live unread badge — SSE stream keeps it fresh, polled query is the fallback.
  useNotificationStream();
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

  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.("[data-header-popover]")) return;
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [notifOpen]);

  return (
    <header className="h-14 shrink-0 px-[18px] flex items-center gap-3.5 border-b border-[var(--line)] bg-[var(--surface)] relative z-30">
      <Button
        variant="outline"
        size="icon"
        className="show-mobile-only"
        onClick={onMobileMenu}
      >
        <Menu size={20} />
      </Button>
      {/* Desktop sidebar collapse toggle */}
      <Button
        variant="outline"
        className="hide-mobile p-1.5 bg-transparent hover:bg-transparent hover:scale-[1.05] transition-all"
        size="lg"
        onClick={toggleSidebar}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </Button>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        <div className="text-[11px] text-[var(--ink-mute)] flex items-center gap-1.5">
          <span>{ws?.name ?? "AsaanRabta Boutique"}</span>
          <span>·</span>
          <span>{ws?.plan ?? "Tier 3"}</span>
        </div>
      </div>
      <div className="flex-1" />

      {/* Desktop search */}
      <Button
        onClick={() => setSearchOpen(true)}
        className="hide-mobile topbar-search-btn flex items-center gap-2.5 px-3 py-[7px] rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-mute)] text-[12.5px] cursor-pointer min-w-[280px]"
      >
        <Search size={13} />
        <span className="flex-1 text-left">
          Search leads, products, orders...
        </span>
        <span className="font-[var(--font-mono)] text-[10.5px] px-[5px] py-px border border-[var(--line)] rounded">
          ⌘K
        </span>
      </Button>

      {/* Mobile search */}
      <Button
        variant="ghost"
        size="icon"
        className="show-mobile-only"
        onClick={() => setSearchOpen(true)}
      >
        <Search size={17} />
      </Button>

      {/* WhatsApp status */}
      <WAStatusButton onClick={() => setWaOpen(true)} />
      <WAConnectDialog open={waOpen} onOpenChange={setWaOpen} />

      {/* Full screen toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullScreen}
        title={isFullScreen ? "Exit full screen" : "Full screen view"}
        className="text-[var(--ink-mute)]"
      >
        <span
          className="block transition-all duration-200"
          style={{
            transform: isFullScreen
              ? "rotate(180deg) scale(1)"
              : "rotate(0deg) scale(1)",
          }}
        >
          {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </span>
      </Button>

      {/* Notifications */}
      <div data-header-popover className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={(e) => {
            e.stopPropagation();
            setNotifOpen((v) => !v);
          }}
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#EF4444] text-white text-[9.5px] font-semibold border-2 border-[var(--surface)] inline-flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
        {notifOpen && (
          <NotificationsPanel onClose={() => setNotifOpen(false)} />
        )}
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
