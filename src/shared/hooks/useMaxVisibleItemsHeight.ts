"use client";
import { useLayoutEffect, useRef, useState } from "react";

// Caps a scroll container right above its (maxVisibleItems + 1)th item, so exactly that many show before scrolling.
export function useMaxVisibleItemsHeight<TContainer extends HTMLElement>({
  itemSelector,
  maxVisibleItems,
  remeasureKey,
}: {
  itemSelector: string;
  maxVisibleItems?: number;
  remeasureKey?: unknown;
}) {
  const containerRef = useRef<TContainer>(null);
  const [maxHeight, setMaxHeight] = useState<number>();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !maxVisibleItems) return;

    const measureMaxHeight = () => {
      const firstOverflowItem =
        container.querySelectorAll<HTMLElement>(itemSelector)[maxVisibleItems];
      if (!firstOverflowItem) {
        setMaxHeight(undefined);
        return;
      }
      const offsetFromContainerTop =
        firstOverflowItem.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      // Bottom border + horizontal scrollbar, so the last visible item isn't clipped.
      const bottomChromeHeight =
        container.offsetHeight - container.clientHeight - container.clientTop;
      setMaxHeight(offsetFromContainerTop + bottomChromeHeight);
    };

    measureMaxHeight();
    const resizeObserver = new ResizeObserver(measureMaxHeight);
    Array.from(container.children).forEach((child) =>
      resizeObserver.observe(child),
    );
    return () => resizeObserver.disconnect();
  }, [itemSelector, maxVisibleItems, remeasureKey]);

  return { containerRef, maxHeight: maxVisibleItems ? maxHeight : undefined };
}
