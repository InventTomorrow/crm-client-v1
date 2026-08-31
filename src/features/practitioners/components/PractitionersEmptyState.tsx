"use client";
import { Button } from "@/shared/ui/Button";
import { Plus, Stethoscope } from "lucide-react";

interface PractitionersEmptyStateProps {
  onAdd: () => void;
  isFiltered: boolean;
}

export function PractitionersEmptyState({
  onAdd,
  isFiltered,
}: PractitionersEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--surface)] py-16 text-center">
        <p className="text-sm font-medium text-[var(--ink)]">
          No practitioners match those filters
        </p>
        <p className="text-sm text-[var(--ink-mute)]">
          Try a different search or specialty.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--surface)] py-16 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <Stethoscope className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--ink)]">
          No practitioners yet
        </p>
        <p className="mx-auto max-w-sm text-sm text-[var(--ink-mute)]">
          Add the doctors and therapists who see patients. You choose whether
          the assistant shows their profiles, and whether patients can book them
          directly.
        </p>
      </div>
      <Button onClick={onAdd}>
        <Plus className="size-4" />
        Add practitioner
      </Button>
    </div>
  );
}
