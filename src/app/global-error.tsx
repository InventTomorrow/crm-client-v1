"use client";

// Top-level error boundary. When an error escapes the root layout, Next.js
// renders this INSTEAD of app/layout.tsx — its own <html>/<body> — so the
// normal GTM snippet there never runs. We re-inject GTM here and push an
// `exception` event so even fatal crashes stay visible to the container.
// (globals.css isn't applied here, hence minimal inline styling.)

import { useEffect } from "react";
import Script from "next/script";
import { GTM_ID, sendGTMEvent } from "@/lib/gtm";

export default function GlobalError({
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
      fatal: true,
    });
  }, [error]);

  return (
    <html lang="en">
      <head>
        {GTM_ID && (
          <Script id="gtm-base-error" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <h2>Something went wrong</h2>
        <button onClick={() => reset()} style={{ marginTop: "1rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
