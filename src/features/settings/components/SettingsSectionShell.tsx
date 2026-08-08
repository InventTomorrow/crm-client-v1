import type { ReactNode } from "react";

/** Shared scroll container for the /settings/* section pages. */
export function SettingsSectionShell({ children }: { children: ReactNode }) {
  return (
    <div className="settings-layout flex h-full gap-3.5 overflow-hidden p-[18px]">
      <div className="settings-content mob-on scroll flex flex-1 flex-col gap-3.5 overflow-y-auto *:shrink-0">
        {children}
      </div>
    </div>
  );
}
