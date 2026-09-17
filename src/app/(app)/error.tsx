"use client";

import { useEffect } from "react";
import { sendGTMEvent } from "@/lib/gtm";
import { Button } from "@/shared/ui/Button";

// Route-segment boundary: keeps the sidebar/layout intact so one broken
// view doesn't blank the whole app shell like global-error.tsx does.
export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    sendGTMEvent({
      event: "exception",
      description: error.message,
      digest: error.digest,
      fatal: false,
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-[var(--ink-mute)]">
        Something went wrong
      </p>
      <h1 className="text-2xl font-bold text-[var(--ink)]">
        This page hit a snag
      </h1>
      <p className="max-w-sm text-sm text-[var(--ink-mute)]">
        Try again, or head back to the dashboard if the problem keeps
        happening.
      </p>
      <div className="mt-2 flex gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
