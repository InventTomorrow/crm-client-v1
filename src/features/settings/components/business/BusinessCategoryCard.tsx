"use client";
import { VerticalCard } from "@/features/onboarding/components/VerticalCard";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { useUpdateBusinessVertical } from "@/features/tenant/hooks/useTenant";
import {
  BUSINESS_VERTICALS,
  getBusinessVerticalShortLabel,
  type BusinessVertical,
} from "@/lib/business-verticals";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useState } from "react";

export function BusinessCategoryCard() {
  const { tenant } = useCurrentTenant();
  const { mutate: updateVertical, isPending: isUpdatingVertical } =
    useUpdateBusinessVertical();
  const [pendingVertical, setPendingVertical] =
    useState<BusinessVertical | null>(null);

  return (
    <>
      <div
        data-tour="business-category"
        className="card p-[22px] flex flex-col gap-3"
      >
        <div>
          <h4 className="text-[13.5px] font-semibold">Business category</h4>
          <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
            Determines which AI agents and workspace pages you get. Changing
            this switches your AI assistant&apos;s behavior immediately.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUSINESS_VERTICALS.map((vertical, index) => (
            <VerticalCard
              key={vertical.value}
              icon={vertical.icon}
              title={vertical.title}
              description={vertical.description}
              selected={tenant?.businessVertical === vertical.value}
              disabled={isUpdatingVertical}
              index={index}
              onSelect={() => setPendingVertical(vertical.value)}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingVertical}
        onClose={() => setPendingVertical(null)}
        onConfirm={() => {
          if (!pendingVertical) return;
          updateVertical(pendingVertical, {
            onSuccess: () => setPendingVertical(null),
          });
        }}
        title={`Switch to ${pendingVertical ? getBusinessVerticalShortLabel(pendingVertical) : ""}?`}
        description="This changes which AI agents and workspace pages your team gets, effective immediately. Existing data isn't deleted, but the assistant's behavior switches right away."
        confirmLabel="Switch business type"
        destructive={false}
        loading={isUpdatingVertical}
      />
    </>
  );
}
