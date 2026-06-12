"use client";

// Fires a GTM pageview on every App Router navigation. Next.js soft
// navigations don't trigger GTM's History listener, so we watch pathname +
// search params and push a virtual pageview ourselves.
//
// `useSearchParams` opts a component into client-side rendering, which would
// de-opt the whole tree if used directly in layout. We isolate it inside a
// Suspense boundary so only the (render-null) tracker is affected.

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GTM_ID, pageview } from "@/lib/gtm";

function GTMRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GTM_ID) return;
    const query = searchParams.toString();
    pageview(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

export function GTMProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <GTMRouteTracker />
      </Suspense>
      {children}
    </>
  );
}
