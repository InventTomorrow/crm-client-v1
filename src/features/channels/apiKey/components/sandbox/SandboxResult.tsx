"use client";
import { cn, extractErrorMessage } from "@/lib/utils";
import { AlertTriangle, Inbox } from "lucide-react";
import type { SandboxHttpResponse } from "../../types";
import { CopyableCode } from "../CopyableCode";

export function SandboxResult({
  sandboxResponse,
  requestError,
}: {
  sandboxResponse?: SandboxHttpResponse;
  requestError?: unknown;
}) {
  return (
    <section className="card flex flex-col gap-4 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Response</h3>
        {sandboxResponse && <HttpStatusBadge httpStatus={sandboxResponse.httpStatus} />}
      </div>

      {requestError ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {extractErrorMessage(requestError, "The request couldn't reach the server.")}
        </div>
      ) : sandboxResponse ? (
        <CopyableCode
          language="json"
          code={JSON.stringify(sandboxResponse.body, null, 2)}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--line)] px-4 py-12 text-center">
          <Inbox size={22} className="text-[var(--ink-mute)]" />
          <p className="text-sm text-[var(--ink-mute)]">
            Send a request to see the API response here.
          </p>
        </div>
      )}
    </section>
  );
}

function HttpStatusBadge({ httpStatus }: { httpStatus: number }) {
  const isSuccess = httpStatus < 400;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs font-semibold",
        isSuccess ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive",
      )}
    >
      HTTP {httpStatus}
    </span>
  );
}
