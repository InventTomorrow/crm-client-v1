"use client";
import { ChannelBreadcrumb } from "@/features/channels/components/ChannelBreadcrumb";
import { Link as LinkIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  API_WORKSPACE_ROOT,
  API_WORKSPACE_SECTIONS,
  isPathActive,
} from "../utils/apiWorkspaceSections";
import { ApiSectionNav } from "./ApiSectionNav";

const WEBSITE_API_LABEL = "Website API";

export function ApiWorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSection = API_WORKSPACE_SECTIONS.find(({ matchPrefix }) =>
    isPathActive(pathname, matchPrefix),
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl p-4 md:p-8">
        <ChannelBreadcrumb
          parent={{ label: WEBSITE_API_LABEL, href: `${API_WORKSPACE_ROOT}/keys` }}
          current={activeSection?.label ?? WEBSITE_API_LABEL}
        />

        <header className="mb-8 flex flex-col gap-5 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <LinkIcon size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold">{WEBSITE_API_LABEL}</h1>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--ink-mute)]">
                Connect your website or storefront so confirmed orders create CRM
                orders and customers get a WhatsApp confirmation.
              </p>
            </div>
          </div>
          <div className="lg:pt-2">
            <ApiSectionNav />
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
