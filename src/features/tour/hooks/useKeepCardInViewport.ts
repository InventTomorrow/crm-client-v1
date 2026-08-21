'use client';
import { useLayoutEffect, useRef, useState } from 'react';

/** Minimum gap kept between the card and the edge of the screen. */
const EDGE_MARGIN = 12;

interface ViewportCorrection {
  x: number;
  y: number;
}

const NO_CORRECTION: ViewportCorrection = { x: 0, y: 0 };

/**
 * NextStep anchors the card to a side of the spotlight and only ever flips that
 * side — it never shifts the card back inside the screen. A target in a corner
 * (the notifications bell, say) therefore pushes half the card out of view.
 *
 * This measures the rendered card and returns the nudge needed to bring it back.
 * The caret is anchored to the spotlight, so it has to be moved the opposite way
 * by the same amount to keep pointing at the target.
 */
export function useKeepCardInViewport(stepKey: unknown) {
  const cardRef = useRef<HTMLDivElement>(null);
  const appliedCorrectionRef = useRef<ViewportCorrection>(NO_CORRECTION);
  const [correction, setCorrection] = useState<ViewportCorrection>(NO_CORRECTION);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let frame = 0;

    const measure = () => {
      const node = cardRef.current;
      if (!node) return;

      // Undo our own nudge so the maths always starts from where NextStep put it.
      const applied = appliedCorrectionRef.current;
      const rect = node.getBoundingClientRect();
      const left = rect.left - applied.x;
      const right = rect.right - applied.x;
      const top = rect.top - applied.y;
      const bottom = rect.bottom - applied.y;

      let x = 0;
      if (right > window.innerWidth - EDGE_MARGIN) x = window.innerWidth - EDGE_MARGIN - right;
      if (left + x < EDGE_MARGIN) x = EDGE_MARGIN - left;

      let y = 0;
      if (bottom > window.innerHeight - EDGE_MARGIN) y = window.innerHeight - EDGE_MARGIN - bottom;
      if (top + y < EDGE_MARGIN) y = EDGE_MARGIN - top;

      appliedCorrectionRef.current = { x, y };
      setCorrection((previous) =>
        Math.abs(previous.x - x) < 0.5 && Math.abs(previous.y - y) < 0.5 ? previous : { x, y },
      );
    };

    // The card animates into place, so re-measure until it settles.
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    scheduleMeasure();
    const settleTimers = [80, 240, 500].map((delay) => setTimeout(scheduleMeasure, delay));

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(card);
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      cancelAnimationFrame(frame);
      settleTimers.forEach(clearTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [stepKey]);

  return { cardRef, correction };
}
