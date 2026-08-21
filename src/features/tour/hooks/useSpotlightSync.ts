'use client';
import { useCallback, useEffect, useRef } from 'react';

/** Re-measure points after a step change: immediate, after paint, after data lands. */
const RESYNC_DELAYS_MS = [50, 200, 500, 900, 1400];

/**
 * Keeps the spotlight glued to its target.
 *
 * NextStep measures the target once per step and then only listens for `resize`
 * and target-size changes. Anything that moves a target without resizing it —
 * scrolling one of our inner scroll containers, a skeleton being replaced by the
 * real grid, a route transition — leaves the cut-out behind. Dispatching
 * `resize` makes the library re-query the selector and re-measure, which is the
 * cheapest way to stay in sync without forking it.
 */
export function useSpotlightSync(isTourActive: boolean, stepKey: string | number) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const resync = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  // Re-measure repeatedly while a step settles into place.
  useEffect(() => {
    if (!isTourActive) return;

    timersRef.current = RESYNC_DELAYS_MS.map((delay) => setTimeout(resync, delay));
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, [isTourActive, stepKey, resync]);

  // Follow the target when any scroll container moves, not just the window.
  useEffect(() => {
    if (!isTourActive) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(resync);
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [isTourActive, resync]);
}
