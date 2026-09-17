"use client";
import { useAppStore } from "@/lib/appStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

/** Blocks the UI with a transparent blurred overlay while the session is repointed at another workspace. */
export function WorkspaceSwitchingOverlay() {
  const { isSwitchingWorkspace, switchingToWorkspaceName } = useAppStore();
  const [visible, setVisible] = useState(false);

  // Keep mounted through the fade-out, then unmount.
  useEffect(() => {
    if (isSwitchingWorkspace) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const fadeOutTimer = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(fadeOutTimer);
  }, [isSwitchingWorkspace]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-[var(--bg)]/60 backdrop-blur-sm transition-opacity duration-300 ease-out"
      style={{ opacity: isSwitchingWorkspace ? 1 : 0 }}
    >
      <Loader2 className="size-8 animate-spin text-[var(--accent)]" />
      <span className="text-sm font-medium text-[var(--ink-mute)]">
        {switchingToWorkspaceName
          ? `Switching to ${switchingToWorkspaceName}…`
          : "Switching workspace…"}
      </span>
    </div>
  );
}
