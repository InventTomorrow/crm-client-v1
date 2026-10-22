"use client";
import { useEffect, useState } from "react";

const TICK_MS = 120;
const CEILING_PERCENT = 92;
const EASE_FACTOR = 0.05;

/** Eases toward a ceiling while a request is in flight, then snaps to 100 once it succeeds. */
export function useSeedProgress(isSeeding: boolean, isDone: boolean): number {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    if (!isSeeding) return;
    const timer = setInterval(() => setTicks((current) => current + 1), TICK_MS);
    return () => {
      clearInterval(timer);
      setTicks(0);
    };
  }, [isSeeding]);

  if (isDone) return 100;
  return CEILING_PERCENT * (1 - (1 - EASE_FACTOR) ** ticks);
}
