import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/CheckoutView";
import { PRIVATE_PAGE_ROBOTS } from "@/shared/seo/metadata";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review and confirm your order.",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <CheckoutView token={token} />
    </div>
  );
}
