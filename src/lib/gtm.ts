// Central Google Tag Manager helpers. Keeps the GTM container ID and all
// dataLayer access in one place so components never touch `window` directly
// or hardcode the ID. Every function is SSR-safe (guards on `window`).

// Read from env, never hardcoded. Empty string when unset so callers can
// cheaply check `if (!GTM_ID) return` and skip GTM entirely in dev/preview.
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

// Push an arbitrary event object onto the dataLayer. This is the generic
// primitive every custom tracking call should go through.
export function sendGTMEvent(event: Record<string, unknown>): void {
  if (typeof window === "undefined" || !GTM_ID) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

// Fire a virtual pageview on client-side route changes. GTM's built-in
// History trigger misses Next.js soft navigations, so we push it manually.
// Includes the full location + document title so GA4/GTM tags get the same
// fields they'd see on a hard navigation — nothing is hidden from the container.
export function pageview(url: string): void {
  sendGTMEvent({
    event: "pageview",
    page: url,
    page_path: url,
    page_location: typeof window !== "undefined" ? window.location.href : url,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}
