import MarketingChrome from "@/features/landing/components/MarketingChrome";
import type { ReactNode } from "react";

/** Blog pages share the marketing chrome. */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
