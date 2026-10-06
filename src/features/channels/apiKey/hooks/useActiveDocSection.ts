"use client";
import { useCallback, useEffect, useState } from "react";

// Top margin clears the app top bar; bottom margin makes a section "active" once it reaches the upper third.
const SCROLL_SPY_ROOT_MARGIN = "-72px 0px -65% 0px";

export function useActiveDocSection(sectionIds: readonly string[]) {
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const topmostVisibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top - second.boundingClientRect.top,
          )[0];
        if (topmostVisibleEntry) setActiveSectionId(topmostVisibleEntry.target.id);
      },
      { rootMargin: SCROLL_SPY_ROOT_MARGIN },
    );

    sectionIds.forEach((sectionId) => {
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) observer.observe(sectionElement);
    });
    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToSection = useCallback((sectionId: string) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSectionId(sectionId);
  }, []);

  return { activeSectionId, scrollToSection };
}
