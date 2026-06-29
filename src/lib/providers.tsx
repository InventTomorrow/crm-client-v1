"use client";
import { useAppStore } from "@/lib/appStore";
import GlobalLoadingOverlay from "@/shared/ui/GlobalLoadingOverlay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

function ThemeSync() {
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000 } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <GlobalLoadingOverlay />
      {children}
    </QueryClientProvider>
  );
}
