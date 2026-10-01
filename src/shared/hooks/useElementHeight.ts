"use client";
import { useLayoutEffect, useRef, useState } from "react";

// Live rendered height of an element, so a sibling can be sized to match it.
export function useElementHeight<TElement extends HTMLElement>() {
  const elementRef = useRef<TElement>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) setHeight(Math.round(entry.contentRect.height));
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  return { elementRef, height };
}
