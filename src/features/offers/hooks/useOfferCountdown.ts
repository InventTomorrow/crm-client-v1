"use client";
import { useSyncExternalStore } from "react";
import type { OfferTimeRemaining } from "../types";

/** One shared 1Hz tick — every countdown on the page re-renders together. */
function subscribeToSecondTick(onTick: () => void): () => void {
  const intervalId = setInterval(onTick, 1000);
  return () => clearInterval(intervalId);
}

/** Whole seconds, so the snapshot only changes once per tick. */
const getCurrentSecond = () => Math.floor(Date.now() / 1000);

/** The server has no clock the client would agree with — render nothing there. */
const getServerSnapshot = () => null;

function remainingFrom(endsAt: string, nowMs: number): OfferTimeRemaining {
  const ms = Math.max(0, new Date(endsAt).getTime() - nowMs);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    hasExpired: ms <= 0,
  };
}

/**
 * Ticking time left until `endsAt`, or null on the server and for the first
 * paint. Driven by useSyncExternalStore rather than an effect so the value is
 * available on the very first client render without risking a hydration
 * mismatch on the seconds digit.
 */
export function useOfferCountdown(endsAt: string | null): OfferTimeRemaining | null {
  const currentSecond = useSyncExternalStore(
    subscribeToSecondTick,
    getCurrentSecond,
    getServerSnapshot,
  );

  if (!endsAt || currentSecond === null) return null;
  return remainingFrom(endsAt, currentSecond * 1000);
}
