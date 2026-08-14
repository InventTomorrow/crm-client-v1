"use client";

import { useRouteProgress } from "@/shared/hooks/useRouteProgress";

/** Thin top-of-viewport bar that tracks every route transition. */
export default function RouteProgressBar() {
  const { percent, isVisible } = useRouteProgress();

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[300] h-[3px]"
      aria-hidden
    >
      <div
        className="h-full rounded-r-full bg-accent shadow-[0_0_10px_var(--accent),0_0_4px_var(--accent)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${percent}%`, opacity: percent >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
