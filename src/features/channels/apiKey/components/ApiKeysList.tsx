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

function formatKeyDate(value: string | null): string {
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
  const [keyPendingRevoke, setKeyPendingRevoke] = useState<ApiKey | null>(null);
  const [keyPendingDelete, setKeyPendingDelete] = useState<ApiKey | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!apiKeys.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center">
        <KeyRound size={22} className="text-[var(--ink-mute)]" />
        <p className="text-sm font-medium">No API keys yet</p>
        <p className="max-w-sm text-sm text-[var(--ink-mute)]">
          Create a Sandbox key to start testing your integration.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)]">
      {apiKeys.map((apiKey: ApiKey, index: number) => {
        const isRevoked = Boolean(apiKey.revokedAt);
        const isLive = apiKey.mode === "LIVE";
        return (
          <div
            key={apiKey.id}
            className={cn(
              "flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center",
              index !== apiKeys.length - 1 && "border-b border-[var(--line-soft)]",
              isRevoked ? "opacity-60" : "hover:bg-[var(--surface-2)]",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  isLive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "bg-warning-soft text-warning-foreground",
                )}
              >
                <KeyRound size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold">
                    {apiKey.name}
                  </span>
                  <Badge variant={isLive ? "default" : "secondary"}>
                    {isLive ? "Live" : "Sandbox"}
                  </Badge>
                  {isRevoked && <Badge variant="destructive">Revoked</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ink-mute)]">
                  <code
                    className="font-mono text-[var(--ink-soft)]"
                    title="The full key was shown once, at creation, and can't be retrieved again — revoke and create a new key if it's lost."
                  >
                    {apiKey.keyPrefix}…
                  </code>
                  <span>Created {formatKeyDate(apiKey.createdAt)}</span>
                  <span>Last used {formatKeyDate(apiKey.lastUsedAt)}</span>
                </div>
              </div>
            </div>

            {isRevoked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start border-destructive/30 bg-destructive-soft text-destructive hover:bg-destructive/15 sm:self-center"
                onClick={() => setKeyPendingDelete(apiKey)}
              >
                <X size={13} /> Delete
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start sm:self-center"
                onClick={() => setKeyPendingRevoke(apiKey)}
              >
                <Trash2 size={13} /> Revoke
              </Button>
            )}
          </div>
        );
      })}

      <ConfirmDialog
        open={Boolean(keyPendingRevoke)}
        onClose={() => setKeyPendingRevoke(null)}
        onConfirm={() => {
          if (!keyPendingRevoke) return;
          revoke(keyPendingRevoke.id, { onSuccess: () => setKeyPendingRevoke(null) });
        }}
        title={`Revoke "${keyPendingRevoke?.name}"?`}
        description="Any integration using this key immediately stops being able to create orders. This can't be undone."
        confirmLabel="Revoke"
        loading={isRevoking}
      />

      <ConfirmDialog
        open={Boolean(keyPendingDelete)}
        onClose={() => setKeyPendingDelete(null)}
        onConfirm={() => {
          if (!keyPendingDelete) return;
          deleteKey(keyPendingDelete.id, {
            onSuccess: () => setKeyPendingDelete(null),
          });
        }}
        title={`Permanently delete "${keyPendingDelete?.name}"?`}
        description="This removes the key from your workspace for good, including its usage history. This can't be undone."
        confirmLabel="Delete permanently"
        loading={isDeleting}
      />
    </div>
  );
}
