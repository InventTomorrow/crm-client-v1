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
      {/* Soft brand wash behind the card so the page doesn't read as a bare
          form on a flat grey field. Purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,var(--accent-soft)_0%,transparent_65%)]"
      />
      <div className="relative">
        <SubscriptionCheckoutView token={token} />
      </div>
    </div>
  );
}
