import { redirect } from "next/navigation";

export default function ApiSandboxPage() {
  redirect("/channels/api/sandbox/orders");
}
