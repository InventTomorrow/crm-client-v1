import { ApiDocsView } from "@/features/channels/apiKey/components/docs/ApiDocsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs · Website API",
  description: "Reference for the Orders API",
};

export default function ApiDocsPage() {
  return <ApiDocsView />;
}
