import { ApiWorkspaceShell } from "@/features/channels/apiKey/components/ApiWorkspaceShell";
import type { ReactNode } from "react";

export default function WebsiteApiLayout({ children }: { children: ReactNode }) {
  return <ApiWorkspaceShell>{children}</ApiWorkspaceShell>;
}
