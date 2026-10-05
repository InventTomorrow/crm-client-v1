"use client";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Eye, EyeOff, KeyRound, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useState } from "react";
import { useActiveApiKeys } from "../../hooks/useApiKeys";
import { isLiveApiKey } from "../../types";
import { API_WORKSPACE_ROOT } from "../../utils/apiWorkspaceSections";

export function SandboxKeyInput({
  liveKeyWarning,
  ...inputProps
}: ComponentProps<typeof Input> & { liveKeyWarning: string }) {
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const isLiveKey = isLiveApiKey(String(inputProps.value ?? ""));

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <KeyRound
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
        />
        <Input
          {...inputProps}
          type={isKeyVisible ? "text" : "password"}
          placeholder="sk_test_… or sk_live_…"
          // Masked like a password, but it isn't one — keep browsers and password managers from offering to save it.
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          spellCheck={false}
          className="pl-9 pr-11 font-mono text-[13px]"
        />
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
          onClick={() => setIsKeyVisible((isVisible) => !isVisible)}
          aria-label={isKeyVisible ? "Hide key" : "Show key"}
          aria-pressed={isKeyVisible}
        >
          {isKeyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
        </Button>
      </div>

      {isLiveKey && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg bg-warning-soft px-3.5 py-2.5 text-sm text-[var(--ink)]"
        >
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warning-foreground" />
          <span>
            <strong className="font-semibold">Live key.</strong> {liveKeyWarning}
          </span>
        </div>
      )}
    </div>
  );
}

export function SandboxKeysHint() {
  const activeApiKeys = useActiveApiKeys();

  if (!activeApiKeys.length) {
    return (
      <>
        No API key yet —{" "}
        <Link
          href={`${API_WORKSPACE_ROOT}/keys`}
          className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          create one
        </Link>{" "}
        first.
      </>
    );
  }

  return (
    <>
      A Sandbox key runs a safe test; a Live key runs the real workflow. The
      full key is shown once, when it&apos;s created. Your keys:{" "}
      {activeApiKeys
        .map((apiKey) => `${apiKey.name} (${apiKey.keyPrefix}…)`)
        .join(", ")}
    </>
  );
}
