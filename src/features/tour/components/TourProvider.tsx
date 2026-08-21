'use client';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useCurrentTenant } from '@/features/tenant/hooks/useCurrentTenant';
import { NextStep, NextStepProvider } from 'nextstepjs';
import { useMemo } from 'react';
import type { TourId } from '../constants';
import { useCompleteTour } from '../hooks/useCompleteTour';
import { buildWorkspaceTour } from '../steps/workspaceSteps';
import { useTourNavigationStore } from '../stores/tourNavigationStore';
import { TourCard } from './TourCard';
import { TourSpotlightSync } from './TourSpotlightSync';
import { TourWatchdog } from './TourWatchdog';

/**
 * Hosts the in-app guide. Only the active workspace's tour is registered, so a
 * restaurant can never be walked through a store's pages.
 *
 * Finishing and skipping both persist — someone who dismissed a tour should not
 * be shown it again on the next sign-in.
 */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useCurrentTenant();
  const { can, isLoading: arePermissionsLoading } = usePermissions();
  const completeTour = useCompleteTour();
  const clearNavigation = useTourNavigationStore((state) => state.clearNavigation);

  const businessVertical = tenant?.businessVertical;

  const tours = useMemo(() => {
    if (arePermissionsLoading) return [];
    const tour = buildWorkspaceTour({ businessVertical, can });
    return tour ? [tour] : [];
    // `can` is rebuilt each render; the permission set behind it is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessVertical, arePermissionsLoading]);

  const markSeen = (tourName: string | null) => {
    clearNavigation();
    if (tourName) completeTour.mutate(tourName as TourId);
  };

  return (
    <NextStepProvider>
      <NextStep
        steps={tours}
        cardComponent={TourCard}
        shadowOpacity="0.5"
        disableConsoleLogs
        onComplete={markSeen}
        onSkip={(_step, tourName) => markSeen(tourName)}
      >
        <TourSpotlightSync />
        <TourWatchdog steps={tours[0]?.steps ?? []} />
        {children}
      </NextStep>
    </NextStepProvider>
  );
}
