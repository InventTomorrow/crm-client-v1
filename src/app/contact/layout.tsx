import MarketingChrome from "@/features/landing/components/MarketingChrome";
import type { ReactNode } from "react";

/** The contact page shares the marketing chrome. */
export default function ContactLayout({ children }: { children: ReactNode }) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
