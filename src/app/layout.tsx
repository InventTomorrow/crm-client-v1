import { Providers } from "@/lib/providers";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
// GTM analytics: the snippet boots the container, GTMProvider tracks SPA pageviews.
import { GTM_ID } from "@/lib/gtm";
import { GTMProvider } from "@/shared/analytics/GTMProvider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://asaanrabta.com",
  ),
  title: {
    default: "AsaanRabta",
    template: "%s · AsaanRabta",
  },
  description:
    "AI-powered CRM for Pakistani e-commerce sellers — one inbox for WhatsApp, Instagram, and more.",
  applicationName: "AsaanRabta",
  openGraph: {
    title: "AsaanRabta",
    description: "AI-powered CRM for Pakistani e-commerce sellers.",
    siteName: "AsaanRabta",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=JSON.parse(localStorage.getItem('sf:app')||'{}');if(t.state?.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        {/* GTM container loader — runs after the page is interactive so it never blocks first paint. */}
        {GTM_ID && (
          <Script id="gtm-base" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
      </head>
      <body className="min-h-full font-sans antialiased bg-[var(--bg)] text-[var(--ink)]">
        {/* GTM <noscript> fallback for JS-disabled clients; must be the first body node. */}
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
        <GTMProvider>
          <Providers>{children}</Providers>
        </GTMProvider>
      </body>
    </html>
  );
}

// head tag
// <!-- Google Tag Manager -->
// <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
// new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
// j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
// 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
// })(window,document,'script','dataLayer','GTM-5DKGKB86');</script>
// <!-- End Google Tag Manager -->

// body tag
// <!-- Google Tag Manager (noscript) -->
// <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5DKGKB86"
// height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
// <!-- End Google Tag Manager (noscript) -->
