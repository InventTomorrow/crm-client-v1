"use client";
import { useCallback, useEffect, useState } from "react";
import type { ActiveOffer } from "../types";

/** Long enough for the visitor to read the page before being interrupted. */
const OPEN_DELAY_MS = 15_000;
const SHOWN_AT_KEY_PREFIX = "asaanrabta:offer-dialog-shown:";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function shownAtKey(offerId: string): string {
  return `${SHOWN_AT_KEY_PREFIX}${offerId}`;
}

/** Keyed by campaign, so a new campaign always gets its own first showing. */
function wasShownWithinADay(offerId: string): boolean {
  try {
    const shownAt = Number(window.localStorage.getItem(shownAtKey(offerId)));
    return Number.isFinite(shownAt) && shownAt > 0 && Date.now() - shownAt < ONE_DAY_MS;
  } catch {
    // Private browsing or a blocked store — treat it as never shown rather
    // than suppressing the campaign entirely.
    return false;
  }
}

function markShown(offerId: string): void {
  try {
    window.localStorage.setItem(shownAtKey(offerId), String(Date.now()));
  } catch {
    // Nothing to do — worst case the dialog opens again on the next visit.
  }
}

/**
 * Opens the offer dialog once a day per campaign, `OPEN_DELAY_MS` after the
 * page settles. Marked as shown when it opens, not when it is dismissed, so a
 * reload mid-countdown doesn't queue up a second one.
 */
export function useOfferDialog(offer: ActiveOffer | null, enabled = true) {
  const [isOpen, setIsOpen] = useState(false);
  const offerId = offer?.id ?? null;

  useEffect(() => {
    if (!offerId || !enabled) return;
    if (wasShownWithinADay(offerId)) return;

    const timeoutId = setTimeout(() => {
      markShown(offerId);
      setIsOpen(true);
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [offerId, enabled]);

  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, close };
}
