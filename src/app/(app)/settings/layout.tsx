import type { ReactNode } from "react";
import { SettingsNav } from "@/features/settings/components/SettingsNav";

// Every /settings/* page keeps its own scroll container; the nav stays fixed on top.
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SettingsNav />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
