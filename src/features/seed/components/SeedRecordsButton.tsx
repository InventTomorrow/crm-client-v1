"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { ScaleIn } from "@/shared/ui/Motion";
import { Spinner } from "@/shared/ui/Spinner";
import { Check, FlaskConical } from "lucide-react";
import { useSeedRecordForm } from "../hooks/useSeedRecordForm";
import type { SeedTarget } from "../types";
import { TEST_ACCOUNT_BUTTON_CLASSES } from "../utils/testAccountStyle";
import { SeedCountStepper } from "./SeedCountStepper";
import { SeedingProgress } from "./SeedingProgress";

interface SeedRecordsButtonProps {
  target: SeedTarget;
  size?: "default" | "lg" | "xl";
}

/** Inline seed control for catalogue pages; renders nothing for non-test users. */
export function SeedRecordsButton({ target, size = "xl" }: SeedRecordsButtonProps) {
  const { user } = useMe();
  if (!user?.isTester) return null;

  return <SeedRecordsPopover target={target} size={size} />;
}

function SeedRecordsPopover({ target, size }: Required<SeedRecordsButtonProps>) {
  const { count, setCount, progress, isSeeding, isDone, seededCount, seed } =
    useSeedRecordForm(target);
  const label = target.label.toLowerCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size}
          className={cn(TEST_ACCOUNT_BUTTON_CLASSES)}
          title="Test account: add sample records"
        >
          {isSeeding ? <Spinner /> : <FlaskConical className="text-warning" />}
          Seed {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] border-dashed border-warning">
        <form onSubmit={seed} className="flex flex-col gap-3">
          <div>
            <h4 className="flex items-center gap-1.5 text-[13px] font-semibold">
              <FlaskConical size={14} className="text-warning" />
              Seed {label}
            </h4>
            <p className="mt-0.5 text-[12px] text-[var(--ink-soft)]">
              Test account only. Adds sample {label} to this workspace.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <SeedCountStepper
              count={count}
              onChange={setCount}
              isDisabled={isSeeding}
              label={target.label}
            />
            <Button
              type="submit"
              variant="outline"
              size="lg"
              disabled={isSeeding}
              className={TEST_ACCOUNT_BUTTON_CLASSES}
            >
              {isSeeding ? <Spinner /> : null}
              {isSeeding ? "Seeding…" : `Seed ${count}`}
            </Button>
          </div>
          {isSeeding && <SeedingProgress count={count} progress={progress} />}
          {isDone && (
            <ScaleIn className="flex items-center gap-2 rounded-[10px] bg-[var(--success-soft)] px-3 py-2 text-[12.5px] font-medium text-[var(--success-foreground)]">
              <Check size={15} />
              {seededCount} {label} added
            </ScaleIn>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}
