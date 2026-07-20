"use client";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { KeyRound, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  useApiKeysQuery,
  useDeleteApiKey,
  useRevokeApiKey,
} from "../hooks/useApiKeys";
import type { ApiKey } from "../types";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApiKeysList() {
  const { data: apiKeys = [], isLoading } = useApiKeysQuery();
  const { mutate: revoke, isPending: isRevoking } = useRevokeApiKey();
  const { mutate: deleteKey, isPending: isDeleting } = useDeleteApiKey();
  const [pendingRevoke, setPendingRevoke] = useState<ApiKey | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApiKey | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!apiKeys.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--line)] py-8 text-center">
        <KeyRound size={20} className="text-[var(--ink-mute)]" />
        <p className="text-[12.5px] text-[var(--ink-mute)]">
          No API keys yet. Create a Sandbox key to start testing your
          integration.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)]">
      {apiKeys.map((apiKey: ApiKey, index: number) => {
        const revoked = Boolean(apiKey.revokedAt);
        const last = index === apiKeys.length - 1;
        return (
          <div
            key={apiKey.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 transition-colors",
              !last && "border-b border-[var(--line-soft)]",
              revoked ? "opacity-50" : "hover:bg-[var(--surface-2)]",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                apiKey.mode === "LIVE"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[#FEF3C7] text-[#92400E]",
              )}
            >
              <KeyRound size={15} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13.5px] font-medium">
                  {apiKey.name}
                </span>
                <Badge
                  variant={apiKey.mode === "LIVE" ? "default" : "secondary"}
                >
                  {apiKey.mode === "LIVE" ? "Live" : "Sandbox"}
                </Badge>
                {revoked && <Badge variant="destructive">Revoked</Badge>}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11.5px] text-[var(--ink-mute)]">
                <code
                  className="font-mono"
                  title="The full key was shown once, at creation, and can't be retrieved again — revoke and create a new key if it's lost."
                >
                  {apiKey.keyPrefix}…
                </code>
                <span className="ml-2">
                  Created {formatDate(apiKey.createdAt)}
                </span>
                <span className="ml-2">
                  Last used: {formatDate(apiKey.lastUsedAt)}
                </span>
              </div>
            </div>

            {!revoked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingRevoke(apiKey)}
              >
                <Trash2 size={12} /> Revoke
              </Button>
            )}
            {revoked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#DC2626] border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2]"
                onClick={() => setPendingDelete(apiKey)}
              >
                <X size={12} /> Delete
              </Button>
            )}
          </div>
        );
      })}

      <ConfirmDialog
        open={Boolean(pendingRevoke)}
        onClose={() => setPendingRevoke(null)}
        onConfirm={() => {
          if (!pendingRevoke) return;
          revoke(pendingRevoke.id, { onSuccess: () => setPendingRevoke(null) });
        }}
        title={`Revoke "${pendingRevoke?.name}"?`}
        description="Any integration using this key will immediately stop being able to create orders. This can't be undone."
        confirmLabel="Revoke"
        loading={isRevoking}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteKey(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
        title={`Permanently delete "${pendingDelete?.name}"?`}
        description="This removes the key from your workspace for good, including its usage history. This can't be undone."
        confirmLabel="Delete permanently"
        loading={isDeleting}
      />
    </div>
  );
}
