"use client";

import type { Ref } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/shared/ui/Input";
import { Slider } from "@/shared/ui/Slider";

// The slider covers typical shops; bigger numbers are typed into the box.
const SLIDER_MAX_LEADS = 5000;
const SLIDER_STEP = 10;

interface LeadCountControlProps {
  name: string;
  value: number;
  onChange: (monthlyLeads: number) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  minLeads: number;
  maxLeads: number;
  isDisabled?: boolean;
  inputClassName?: string;
}

/** Slider and exact-number box side by side, both driving the same lead count. */
export function LeadCountControl({
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  minLeads,
  maxLeads,
  isDisabled = false,
  inputClassName,
}: LeadCountControlProps) {
  const sliderLeads = Math.min(
    Math.max(Number.isNaN(value) ? minLeads : value, minLeads),
    SLIDER_MAX_LEADS,
  );

  return (
    <div className="flex items-center gap-4">
      <Slider
        aria-label="Leads per month"
        className="flex-1"
        min={minLeads}
        max={SLIDER_MAX_LEADS}
        step={SLIDER_STEP}
        disabled={isDisabled}
        value={[sliderLeads]}
        onValueChange={([selectedLeads]) => {
          if (selectedLeads !== undefined) onChange(selectedLeads);
        }}
      />
      <Input
        type="number"
        inputMode="numeric"
        aria-label="Exact leads per month"
        min={minLeads}
        max={maxLeads}
        disabled={isDisabled}
        name={name}
        ref={inputRef}
        onBlur={onBlur}
        value={Number.isNaN(value) ? "" : value}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className={cn("h-10 w-28 shrink-0 text-right tabular-nums", inputClassName)}
      />
    </div>
  );
}
