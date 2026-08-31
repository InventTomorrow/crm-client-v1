"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { SHOW_DEMO_FLAG } from "@/features/demo/constants";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { usePathname } from "next/navigation";
import { useNextStep } from "nextstepjs";
import { useEffect, useRef } from "react";
import { TOUR_MIN_VIEWPORT_WIDTH } from "../constants";
import { tourIdFor } from "../steps/workspaceSteps";
import { useWelcomeDialogStore } from "../stores/welcomeDialogStore";

/** Lets the welcome dialog finish animating out before the spotlight appears. */
const START_DELAY_MS = 450;

/**
 * Starts the guide once per workspace type. Renders nothing.
 *
 * Skipped on mobile — the sidebar is replaced by MobileDock there, so most
 * targets are absent. Mobile users can still replay it from the profile menu.
 */
export function WorkspaceTourStarter() {
  const { user } = useMe();
  const { tenant } = useCurrentTenant();
  const pathname = usePathname();
  const { startNextStep } = useNextStep();
  const isWelcomeDialogOpen = useWelcomeDialogStore(
    (state) => state.isWelcomeDialogOpen,
  );
  const hasStartedRef = useRef(false);

  const tourId = tourIdFor(tenant?.businessVertical);
  const hasSeenTour =
    !tourId || (user?.completedTours?.includes(tourId) ?? true);

  useEffect(() => {
    if (hasStartedRef.current || hasSeenTour || !tourId) return;
    if (pathname !== "/dashboard") return;
    if (window.innerWidth < TOUR_MIN_VIEWPORT_WIDTH) return;
    // The welcome dialog goes first; it clears the flag as it closes.
    if (isWelcomeDialogOpen || localStorage.getItem(SHOW_DEMO_FLAG) === "1")
      return;

    hasStartedRef.current = true;
    const timer = setTimeout(() => startNextStep(tourId), START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasSeenTour, tourId, pathname, isWelcomeDialogOpen, startNextStep]);

  return null;
}
