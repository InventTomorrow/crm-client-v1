import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

// jsdom has no ResizeObserver; Radix's Checkbox measures itself with one.
class NoopResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= NoopResizeObserver;

// A fresh client per render, with retries off so a failing request surfaces at once.
export function renderWithQueryClient(element: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{element}</QueryClientProvider>);
}

export const TEST_LEAD_VOCABULARY = {
  plural: "leads",
  statusMeta: {
    prospect: { label: "Prospect" },
    warm: { label: "Warm" },
    hot: { label: "Hot" },
  },
};
