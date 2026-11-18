import MarketingChrome from "@/features/landing/components/MarketingChrome";
import type { ReactNode } from "react";

/** The affiliate application page shares the marketing chrome. */
export default function AffiliateProgramLayout({ children }: { children: ReactNode }) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
