"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/lib/appStore";
import LoadingScreen from "./LoadingScreen";

/**
 * Renders the branded full-screen loader during auth transitions (login/logout).
 * The flag is set in the auth mutations and auto-cleared once the route changes,
 * so it bridges the gap from the click until the destination starts rendering.
 */
export default function GlobalLoadingOverlay() {
  const authTransition = useAppStore((s) => s.authTransition);
  const setAuthTransition = useAppStore((s) => s.setAuthTransition);
  const pathname = usePathname();

  useEffect(() => {
    if (useAppStore.getState().authTransition) setAuthTransition(false);
  }, [pathname, setAuthTransition]);

  if (!authTransition) return null;
  return <LoadingScreen />;
}
