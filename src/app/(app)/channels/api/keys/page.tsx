import { ApiKeysView } from "@/features/channels/apiKey/components/ApiKeysView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API keys · Website API",
  description: "Create, revoke and delete the API keys your website uses",
};

export default function ApiKeysPage() {
  return <ApiKeysView />;
}
