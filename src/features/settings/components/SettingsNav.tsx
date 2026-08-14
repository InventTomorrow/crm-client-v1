"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { NAV_ITEMS } from "@/shared/layout/navItems";
import { cn } from "@/lib/utils";

/**
 * Horizontal section switcher shown on every /settings/* page. Reuses the
 * sidebar's settings children so labels, icons, and permission gates never
 * drift between the two navigations.
 */
export function SettingsNav() {
  const pathname = usePathname();
  const { can, isLoading: permsLoading } = usePermissions();

  const settingsSections =
    NAV_ITEMS.find((item) => item.href === "/settings")?.children ?? [];
  const visibleSections = settingsSections.filter(
    (section) => permsLoading || !section.perm || can(section.perm),
  );

  return (
    <nav
      aria-label="Settings sections"
      className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--line)] bg-[var(--bg)] px-[18px] py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {visibleSections.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12.5px] font-medium no-underline transition-colors",
              isActive
                ? "bg-[var(--ink)] text-[var(--bg)] shadow-sm"
                : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
            )}
          >
            {Icon && <Icon size={14} />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
