"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ChannelBreadcrumb } from "@/features/channels/components/ChannelBreadcrumb";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  BookOpen,
  FlaskConical,
  KeyRound,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { ApiDocsPanel } from "./ApiDocsPanel";
import { ApiKeysList } from "./ApiKeysList";
import { ApiSandboxTester } from "./ApiSandboxTester";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";

type OrderApiSection = "keys" | "docs" | "sandbox";

const NAV_ITEMS: {
  id: OrderApiSection;
  label: string;
  icon: typeof KeyRound;
}[] = [
  { id: "keys", label: "API keys", icon: KeyRound },
  { id: "docs", label: "Docs", icon: BookOpen },
  { id: "sandbox", label: "Sandbox", icon: FlaskConical },
];

export function OrderApiView() {
  const { can } = usePermissions();
  const canManageKeys = can("api_keys:manage");
  const [createOpen, setCreateOpen] = useState(false);
  const [section, setSection] = useState<OrderApiSection>("keys");

  return (
    <div className="max-w-6xl p-4 md:p-8">
      <ChannelBreadcrumb current="Website Orders API" />

      {/* Hero header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <LinkIcon size={22} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold font-[var(--font-head)]">
            Website Orders API
          </h1>
          <p className="mt-0.5 text-[13.5px] text-[var(--ink-mute)]">
            Connect your storefront or website so confirmed orders create CRM
            orders automatically.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-5">
        {/* Section nav */}
        <div className="card flex w-[200px] shrink-0 flex-col gap-1 p-2.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="card min-w-0 flex-1 p-5">
          {section === "keys" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold">API keys</h3>
                {canManageKeys && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus size={13} /> New API key
                  </Button>
                )}
              </div>
              <ApiKeysList />
              {!canManageKeys && (
                <p className="text-[11.5px] text-[var(--ink-mute)]">
                  You don&apos;t have permission to create or revoke API keys.
                  Ask a workspace owner.
                </p>
              )}
            </div>
          )}

          {section === "docs" && <ApiDocsPanel />}

          {section === "sandbox" && <ApiSandboxTester />}
        </div>
      </div>

      <CreateApiKeyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
