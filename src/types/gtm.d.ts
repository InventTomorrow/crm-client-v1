// Augments the global Window type so TypeScript knows about the GTM dataLayer
// array that the GTM snippet creates. Without this, any `window.dataLayer`
// access throws "Property 'dataLayer' does not exist on type 'Window'".
export {};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
