import { AppShell } from "@/shared/layout/AppShell";
import { PRIVATE_PAGE_ROBOTS } from "@/shared/seo/metadata";
import type { Metadata } from "next";

// Server layout so the whole authenticated CRM segment carries noindex.
export const metadata: Metadata = { robots: PRIVATE_PAGE_ROBOTS };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
