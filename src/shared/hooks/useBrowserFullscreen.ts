"use client";

import { useAppStore } from "@/lib/appStore";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Puts the whole app into browser fullscreen and collapses the sidebar so the
 * page gets the full viewport. The header toggle stays available, so the
 * sidebar can be reopened without leaving fullscreen.
 */
export function useBrowserFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  // Captured on entry so exiting restores whatever the sidebar was before.
  const sidebarStateBeforeFullscreen = useRef(sidebarCollapsed);

  // ESC and the browser's own chrome exit fullscreen without going through our
  // click handler, so mirror the document's real state rather than assuming.
  useEffect(() => {
    const syncFullscreenState = () => {
      const isActive = !!document.fullscreenElement;
      setIsFullscreen(isActive);
      if (!isActive) setSidebarCollapsed(sidebarStateBeforeFullscreen.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, [setSidebarCollapsed]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    sidebarStateBeforeFullscreen.current = sidebarCollapsed;
    void document.documentElement
      .requestFullscreen()
      .then(() => setSidebarCollapsed(true))
      .catch(() => {});
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return { isFullscreen, toggleFullscreen };
}
