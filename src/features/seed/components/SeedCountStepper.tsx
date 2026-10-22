"use client";
import { Button } from "@/shared/ui/Button";
import { Minus, Plus } from "lucide-react";
import { SEED_MAX_COUNT } from "../types";

interface SeedCountStepperProps {
  count: number;
  onChange: (next: number) => void;
  isDisabled: boolean;
  label: string;
}

export function SeedCountStepper({ count, onChange, isDisabled, label }: SeedCountStepperProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-[10px] border border-[var(--line)] p-1"
      role="group"
      aria-label={`Number of ${label.toLowerCase()} to seed`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isDisabled || count <= 1}
        onClick={() => onChange(count - 1)}
        aria-label="Decrease count"
      >
        <Minus />
      </Button>
      <span className="w-8 text-center text-[14px] font-semibold tabular-nums">{count}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isDisabled || count >= SEED_MAX_COUNT}
        onClick={() => onChange(count + 1)}
        aria-label="Increase count"
      >
        <Plus />
      </Button>
    </div>
  );
}
