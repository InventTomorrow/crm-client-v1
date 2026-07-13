import { useEffect, type RefObject } from "react";

/** Fetches the next page once the sentinel div scrolls into view. */
export function useInfiniteScrollSentinel(
  sentinelRef: RefObject<HTMLDivElement | null>,
  hasNextPage: boolean | undefined,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void,
) {
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef, hasNextPage, isFetchingNextPage, fetchNextPage]);
}
