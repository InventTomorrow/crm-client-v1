import type { Metadata } from "next";
import { SubscriptionCheckoutView } from "@/features/subscription-checkout/SubscriptionCheckoutView";

export const metadata: Metadata = {
  title: "Complete your subscription",
  description: "Confirm your plan and upload your payment receipt.",
};

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SubscriptionCheckoutView token={token} />
    </div>
  );
}
