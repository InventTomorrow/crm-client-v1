"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const TRICKLE_INTERVAL_MS = 180;
const MAX_TRICKLE_PERCENT = 92;
const COMPLETE_HOLD_MS = 260;
const MIN_VISIBLE_MS = 300;
const STALLED_NAVIGATION_MS = 20_000;

/**
 * Drives the global top progress bar for route transitions.
 * Starts on link clicks, programmatic pushes and back/forward, then trickles
 * while the destination route compiles/streams and completes on pathname change.
 */
export function useRouteProgress() {
  const pathname = usePathname();
  const [percent, setPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const isRunningRef = useRef(false);
  const isFinishingRef = useRef(false);
  const startedAtRef = useRef(0);
  const trickleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stalledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    trickleTimerRef.current = null;
    stalledTimerRef.current = null;
    completeTimerRef.current = null;
  }, []);

  const completeNow = useCallback(() => {
    isRunningRef.current = false;
    isFinishingRef.current = false;
    clearTimers();
    setPercent(100);
    completeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setPercent(0);
    }, COMPLETE_HOLD_MS);
  }, [clearTimers]);

  // Hold the bar for a minimum beat so instant navigations don't flash.
  const finish = useCallback(() => {
    if (!isRunningRef.current || isFinishingRef.current) return;

    const remainingMs = MIN_VISIBLE_MS - (Date.now() - startedAtRef.current);
    if (remainingMs <= 0) {
      completeNow();
      return;
    }

    isFinishingRef.current = true;
    completeTimerRef.current = setTimeout(completeNow, remainingMs);
  }, [completeNow]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    isFinishingRef.current = false;
    startedAtRef.current = Date.now();
    clearTimers();
    setIsVisible(true);
    setPercent(8);

    trickleTimerRef.current = setInterval(() => {
      setPercent((current) =>
        current >= MAX_TRICKLE_PERCENT
          ? current
          : current + Math.max(0.5, (MAX_TRICKLE_PERCENT - current) * 0.14),
      );
    }, TRICKLE_INTERVAL_MS);

    stalledTimerRef.current = setTimeout(finish, STALLED_NAVIGATION_MS);
  }, [clearTimers, finish]);

  // Link clicks and back/forward — the earliest signal a navigation began.
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor || !anchor.href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      start();
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", start);
    };
  }, [start]);

  // router.push/replace never bubble a click — catch them at the history level.
  useEffect(() => {
    const originalPushState = window.history.pushState;

    window.history.pushState = function patchedPushState(
      ...args: Parameters<History["pushState"]>
    ) {
      const [, , nextUrl] = args;
      if (nextUrl) {
        const destination = new URL(String(nextUrl), window.location.href);
        // Next pushes history from inside React's commit phase, so starting the
        // bar synchronously would schedule state from an insertion effect.
        if (destination.pathname !== window.location.pathname) queueMicrotask(start);
      }
      return originalPushState.apply(this, args);
    };

    return () => {
      window.history.pushState = originalPushState;
    };
  }, [start]);

  // Full page loads (refresh, hard navigation) still finish through hydration.
  useEffect(() => {
    if (document.readyState === "complete") return;
    start();
    window.addEventListener("load", finish);
    return () => window.removeEventListener("load", finish);
  }, [start, finish]);

  // The destination segment rendered — the navigation is done.
  useEffect(() => {
    finish();
  }, [pathname, finish]);

  useEffect(() => clearTimers, [clearTimers]);

  return { percent, isVisible };
}
