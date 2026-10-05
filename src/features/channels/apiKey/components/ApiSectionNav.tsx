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
    <nav aria-label="Website API pages" className="flex items-center gap-6">
      {API_WORKSPACE_SECTIONS.map(({ href, matchPrefix, label }) => {
        const isActive = isPathActive(pathname, matchPrefix);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-[15px] font-medium underline-offset-[6px] transition-colors",
              isActive
                ? "text-[var(--accent)] underline decoration-2"
                : "text-[var(--ink-soft)] no-underline hover:text-[var(--ink)] hover:underline",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
