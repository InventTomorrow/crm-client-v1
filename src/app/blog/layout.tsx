import Footer from "@/features/landing/components/sections/Footer";
import Navbar from "@/features/landing/components/sections/Navbar";
import { Inter } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

/** Blog pages share the marketing chrome — same nav, same footer, same type. */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={inter.variable}
      style={
        {
          fontFamily: "var(--font-inter)",
          "--font-head": "var(--font-inter)",
          "--font-body": "var(--font-inter)",
        } as CSSProperties
      }
    >
      <div className="min-h-screen bg-white text-brand-dark antialiased">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
