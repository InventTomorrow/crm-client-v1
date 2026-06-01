import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SaleFlow CRM",
  description: "AI-powered CRM for Pakistani e-commerce sellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=JSON.parse(localStorage.getItem('sf:app')||'{}');if(t.state?.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full font-sans antialiased bg-[var(--bg)] text-[var(--ink)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
