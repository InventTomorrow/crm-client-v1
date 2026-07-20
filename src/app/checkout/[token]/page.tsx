import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review and confirm your order.",
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
