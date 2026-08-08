"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useInboxUnreadCount } from "@/features/inbox/hooks/useConversations";
import { useLeadsCount } from "@/features/leads/hooks/useLeads";
import { usePendingOrdersCount } from "@/features/orders/hooks/useOrders";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { hasCapability, type VerticalCapability } from "@/lib/business-verticals";
import { useAppStore } from "@/lib/appStore";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChevronDown, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS, type NavItem } from "./navItems";
import { ProfileMenu } from "./ProfileMenu";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarOfferCard } from "./SidebarOfferCard";
import { WorkspaceSwitcherV2 } from "./WorkspaceSwitcherV2";

interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AppSidebar({ mobileOpen, onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useAppStore();
  const { user } = useMe();
  const { can, isLoading: permsLoading } = usePermissions();
  const { tenant } = useCurrentTenant();
  const navItems = NAV_ITEMS.filter(
    (item) =>
      (permsLoading || !item.perm || can(item.perm)) &&
      (!item.capability || hasCapability(tenant?.businessVertical, item.capability)),
  );
  const { data: inboxUnread } = useInboxUnreadCount();
  const { data: leadsCount } = useLeadsCount();
  const { data: pendingOrders } = usePendingOrdersCount();
  const badgeFor = (href: string): number | undefined => {
    if (href === "/inbox") return inboxUnread || undefined;
    if (href === "/leads") return leadsCount || undefined;
    if (href === "/orders") return pendingOrders || undefined;
    return undefined;
  };
  const [profileOpen, setProfileOpen] = useState(false);
  const collapsed = sidebarCollapsed;

  // Sections open themselves when you're inside them; this only records the ones you've
  // since clicked open or shut, so a manual choice isn't undone on the next render.
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, boolean>>({});
  const toggleSection = (href: string) =>
    setSectionOverrides((current) => ({
      ...current,
      [href]: !(current[href] ?? isPathnameUnder(href)),
    }));

  function isPathnameUnder(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function isSectionExpanded(item: NavItem) {
    return sectionOverrides[item.href] ?? isPathnameUnder(item.href);
  }

  const canAccess = (perm?: string) => permsLoading || !perm || can(perm);
  const canUseCapability = (capability?: VerticalCapability) =>
    !capability || hasCapability(tenant?.businessVertical, capability);

  // Inbox wants maximum chat space — collapse the sidebar once on entry, while

  // const isInbox = pathname.startsWith("/inbox");
  // const wasInboxRef = useRef(false);
  // useEffect(() => {
  //   let timer: ReturnType<typeof setTimeout> | undefined;
  //   if (isInbox && !wasInboxRef.current && !sidebarCollapsed) {
  //     timer = setTimeout(() => toggleSidebar(), 400);
  //   }
  //   wasInboxRef.current = isInbox;
  //   return () => clearTimeout(timer);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isInbox]);

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.("[data-header-popover]")) return;
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  const width = collapsed ? 68 : 232;
  const profileName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "";
  const profileEmail = user?.email || "";

  return (
    <>
      {mobileOpen && (
        <div className="scrim show-mobile-only" onClick={onCloseMobile} />
      )}
      <aside
        className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}
        style={{
          width,
          transition:
            "width 240ms cubic-bezier(.22,.9,.4,1), transform 260ms cubic-bezier(.22,.9,.4,1)",
        }}
      >
        {/* Logo — the collapse toggle lives in the top bar (hamburger) */}
        <div
          className={cn(
            "flex gap-2.5",
            collapsed
              ? "flex-col items-center px-0 pt-[14px] pb-1.5"
              : "items-center px-[14px] pt-[14px] pb-1.5",
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <Image
              src="/asaanrabta-icon.png"
              alt="AsaanRabta"
              width={32}
              height={32}
              priority
              className="w-8 h-8 rounded-[9px] shrink-0"
            />
            {!collapsed && (
              <span className="font-[var(--font-head)] font-bold text-[14px] tracking-[-0.02em] text-[var(--ink)]">
                Asaan<span className="text-[var(--accent)]">Rabta</span>
              </span>
            )}
          </Link>
        </div>

        {/* Hand-rolled variant kept at ./WorkspaceSwitcher for a quick revert. */}
        <WorkspaceSwitcherV2 collapsed={collapsed} />

        {/* Nav items */}
        <nav
          className={cn(
            "flex flex-col gap-0.5 flex-1",
            collapsed ? "px-[10px] py-1" : "px-3 py-1",
          )}
        >
          {!collapsed && (
            <div className="text-[10px] text-[var(--ink-mute)] uppercase tracking-[0.12em] font-semibold px-3 pt-[10px] pb-1.5">
              Workspace
            </div>
          )}
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              badge={badgeFor(item.href)}
              expanded={isSectionExpanded(item)}
              onToggleExpanded={() => toggleSection(item.href)}
              onNavigate={onCloseMobile}
              canAccess={canAccess}
              canUseCapability={canUseCapability}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 flex flex-col gap-2.5 border-t border-[var(--line)] relative">
          {!collapsed && <SidebarOfferCard />}
          {!collapsed ? (
            <div className="theme-seg">
              <button
                className={theme !== "dark" ? "on" : ""}
                onClick={() => theme === "dark" && toggleTheme()}
              >
                <Sun size={13} /> Light
              </button>
              <button
                className={theme === "dark" ? "on" : ""}
                onClick={() => theme !== "dark" && toggleTheme()}
              >
                <Moon size={13} /> Dark
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="w-full justify-center"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
          )}

          {/* Profile */}
          <div data-header-popover className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className={cn(
                "flex items-center gap-2.5 w-full rounded-lg cursor-pointer border border-transparent font-[inherit] transition-colors hover:bg-[var(--surface-2)]",
                collapsed ? "justify-center p-1" : "justify-start px-2 py-1.5",
                profileOpen ? "bg-[var(--surface-2)]" : "bg-transparent",
              )}
            >
              <CRMAvatar name={profileName} size={28} />
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[12.5px] font-medium text-[var(--ink)]">
                      {profileName}
                    </div>
                    <div className="text-[10.5px] text-[var(--ink-mute)] truncate">
                      {profileEmail}
                    </div>
                  </div>
                  <ChevronDown size={13} className="text-[var(--ink-mute)]" />
                </>
              )}
            </button>
            {profileOpen && (
              <div
                className={cn(
                  "absolute bottom-[calc(100%+8px)] z-[80]",
                  collapsed ? "left-[calc(100%+8px)]" : "left-0 right-0",
                )}
              >
                <ProfileMenu onClose={() => setProfileOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
