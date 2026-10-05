import { OrderSandboxView } from "@/features/channels/apiKey/components/sandbox/OrderSandboxView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders sandbox · Website API",
  description: "Test the Orders API with a Sandbox or Live key",
};

export default function OrderSandboxPage() {
  return <OrderSandboxView />;
}
