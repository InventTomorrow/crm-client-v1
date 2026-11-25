"use client";
import { Button } from "@/shared/ui/Button";
import { Copy, Link2, Ticket } from "lucide-react";
import { toast } from "sonner";
import type { AffiliateShareCode } from "../../types";

const copyToClipboard = async (text: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error("Couldn't copy. Select the text and copy it instead.");
  }
};

function isCodeUsable(shareCode: AffiliateShareCode): boolean {
  if (!shareCode.isActive) return false;
  if (shareCode.expiresAt && new Date(shareCode.expiresAt).getTime() <= Date.now()) return false;
  return shareCode.maxRedemptions === null || shareCode.uses < shareCode.maxRedemptions;
}

export function AffiliateShareCodes({
  codes,
  canCreateCodes,
}: {
  codes: AffiliateShareCode[];
  canCreateCodes: boolean;
}) {
  if (codes.length === 0) {
    return (
      <p className="text-[12.5px] text-[var(--ink-mute)]">
        {canCreateCodes
          ? "No codes yet. Create your first one to start sharing."
          : "No codes yet. Ask your account manager to create one."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {codes.map((shareCode) => {
        const isUsable = isCodeUsable(shareCode);
        return (
          <div
            key={shareCode.code}
            className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-2)] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Ticket size={15} className="text-[var(--accent)]" />
                <span className="font-mono text-[17px] font-semibold tracking-wide text-[var(--ink)]">
                  {shareCode.code}
                </span>
                {shareCode.createdByAffiliate && (
                  <span className="text-[10.5px] text-[var(--ink-mute)]">Created by you</span>
                )}
              </div>
              <span className="badge bg-[var(--accent-soft)] font-medium text-[var(--accent)]">
                {shareCode.discountPercent}% off for them
              </span>
            </div>
            <div className="mt-1.5 text-[11.5px] text-[var(--ink-mute)]">
              {isUsable ? "Active" : "Not accepting new sign-ups"} · {shareCode.uses} used
              {shareCode.maxRedemptions !== null ? ` of ${shareCode.maxRedemptions}` : ""}
              {shareCode.expiresAt
                ? ` · until ${new Date(shareCode.expiresAt).toLocaleDateString()}`
                : ""}
            </div>
            <div className="mt-2.5 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareCode.code, "Code copied")}
              >
                <Copy /> Copy code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareCode.shareUrl, "Sign-up link copied")}
              >
                <Link2 /> Copy sign-up link
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
