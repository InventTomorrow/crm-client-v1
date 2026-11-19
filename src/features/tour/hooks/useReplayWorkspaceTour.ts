"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { useRouter } from "next/navigation";
import { useNextStep } from "nextstepjs";
import { tourIdFor } from "../steps/workspaceSteps";

export function useReplayWorkspaceTour() {
  const router = useRouter();
  const { tenant } = useCurrentTenant();
  const { startNextStep } = useNextStep();
  const tourId = tourIdFor(tenant?.businessVertical);

  // The guide opens on dashboard elements, so land there before it starts.
  const replayWorkspaceTour = () => {
    if (!tourId) return;
    router.push("/dashboard");
    setTimeout(() => startNextStep(tourId), 300);
  };

  return { canReplayTour: Boolean(tourId), replayWorkspaceTour };
}
