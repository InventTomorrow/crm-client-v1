"use client";
import { Button } from "@/shared/ui/Button";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { AffiliateProfile } from "../../types";
import { AffiliateShareCodes } from "./AffiliateShareCodes";
import { CreateOwnCodeDialog } from "./CreateOwnCodeDialog";

export function AffiliateCodesCard({ profile }: { profile: AffiliateProfile }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const maxDiscountPercent = profile.selfServeMaxDiscountPercent;
  const ownCodeCount = profile.codes.filter((shareCode) => shareCode.createdByAffiliate).length;
  const canCreateCodes = !!maxDiscountPercent && profile.status === "ACTIVE";
  const hasReachedLimit = ownCodeCount >= profile.selfServeCodeLimit;

  return (
    <div className="card p-[18px]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[14px] font-semibold">Your codes</h3>
          {canCreateCodes && (
            <div className="text-[11.5px] text-[var(--ink-mute)]">
              Up to {maxDiscountPercent}% off · {ownCodeCount} of {profile.selfServeCodeLimit} created by you
            </div>
          )}
        </div>
        {canCreateCodes && (
          <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(true)} disabled={hasReachedLimit}>
            <Plus /> Create code
          </Button>
        )}
      </div>

      <AffiliateShareCodes codes={profile.codes} canCreateCodes={canCreateCodes} />

      {canCreateCodes && (
        <CreateOwnCodeDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          maxDiscountPercent={maxDiscountPercent}
        />
      )}
    </div>
  );
}
