"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  API_WORKSPACE_SECTIONS,
  isPathActive,
} from "../utils/apiWorkspaceSections";

export function ApiSectionNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Website API pages"
      className="mb-6 flex items-stretch overflow-x-auto border border-[var(--line)] bg-[var(--surface)]"
    >
      {API_WORKSPACE_SECTIONS.map(({ href, matchPrefix, label }) => {
        const isActive = isPathActive(pathname, matchPrefix);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-12 items-center border-b-[3px] px-5 text-[13.5px] whitespace-nowrap transition-colors",
              isActive
                ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--ink)]"
                : "border-transparent font-medium text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
