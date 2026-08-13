import { Suspense } from "react";
import type { Metadata } from "next";
import { PricingView } from "@/features/pricing/components/PricingView";

export const metadata: Metadata = {
  title: "Plans & Pricing",
  description: "Compare plans and choose the one that fits your workspace",
};

export default function PricingPage() {
  return (
    // .app-content is overflow:hidden, so each route owns its own scroll
    // container — without this the plan list is simply clipped.
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <Suspense fallback={null}>
        <PricingView />
      </Suspense>
    </div>
  );
}
