import type { Metadata } from "next";
import { SubscriptionCheckoutView } from "@/features/subscription-checkout/SubscriptionCheckoutView";
import { PRIVATE_PAGE_ROBOTS } from "@/shared/seo/metadata";

export const metadata: Metadata = {
  title: "Complete your subscription",
  description: "Confirm your plan and upload your payment receipt.",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      {/* Multi-stop decorative wash — top accent glow + subtle bottom warmth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, var(--accent-soft) 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 80% 100%, color-mix(in oklch, var(--accent) 8%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative">
        <SubscriptionCheckoutView token={token} />
      </div>
    </div>
  );
}

