"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { Button } from "@/shared/ui/Button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ApiKeysList } from "./ApiKeysList";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";

export function ApiKeysView() {
  const { can } = usePermissions();
  const canManageKeys = can("api_keys:manage");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <section className="card flex flex-col gap-5 p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">API keys</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--ink-mute)]">
            Keys let your website call the Orders API. Start
            with a Sandbox key, then create a Live key when your integration
            is ready.
          </p>
        </div>
        {canManageKeys && (
          <Button
            type="button"
            className="shrink-0 self-start"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus size={15} /> New API key
          </Button>
        )}
      </div>

      <ApiKeysList />

      {!canManageKeys && (
        <p className="text-sm text-[var(--ink-mute)]">
          You don&apos;t have permission to create or revoke API keys. Ask a
          workspace owner.
        </p>
      )}

      <CreateApiKeyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </section>
  );
}
