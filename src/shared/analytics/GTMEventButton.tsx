"use client";

// Reference example showing the custom-event pattern: any interaction can
// report to GTM by calling `sendGTMEvent` with an `event` name plus arbitrary
// payload. Copy this shape for real tracking (CTA clicks, form submits, etc.).

import { sendGTMEvent } from "@/lib/gtm";
import { Button } from "@/shared/ui/Button";

export function GTMEventButton() {
  return (
    <Button
      onClick={() =>
        sendGTMEvent({
          event: "button_click",
          label: "example_cta",
          location: "demo",
        })
      }
    >
      Send GTM event
    </Button>
  );
}
