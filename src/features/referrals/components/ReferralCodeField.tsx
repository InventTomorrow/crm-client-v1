"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/shared/ui/Input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { CheckCircle2, Loader2, Ticket, XCircle } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { ReferralCodeCheckState } from "../hooks/useReferralCodeCheck";

interface ReferralCodeFieldProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>;
  name: Path<TFormValues>;
  checkState: ReferralCodeCheckState;
  isOpen: boolean;
  onOpen: () => void;
}

function CheckStatusLine({ checkState }: { checkState: ReferralCodeCheckState }) {
  if (checkState.status === "empty") return null;
  if (checkState.status === "checking") {
    return (
      <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-mute)]">
        <Loader2 size={12} className="animate-spin" /> Checking code…
      </p>
    );
  }
  if (checkState.status === "valid") {
    return (
      <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-success-foreground">
        <CheckCircle2 size={13} /> {checkState.discountPercent}% off your first paid plan
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-[11.5px] text-destructive">
      <XCircle size={13} />
      {checkState.status === "invalid"
        ? checkState.message
        : "Use 3 to 20 letters or numbers"}
    </p>
  );
}

/** Optional referral code, collapsed until asked for or prefilled from a share link. */
export function ReferralCodeField<TFormValues extends FieldValues>({
  control,
  name,
  checkState,
  isOpen,
  onOpen,
}: ReferralCodeFieldProps<TFormValues>) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-1.5 self-start text-[12.5px] font-medium text-[var(--accent)] hover:underline"
      >
        <Ticket size={13} /> Have a referral code?
      </button>
    );
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
            Referral code <span className="font-normal text-[var(--ink-mute)]">(optional)</span>
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Ticket
                size={13}
                className="pointer-events-none absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
              />
              <Input
                className={cn(
                  "h-10 pl-8 font-mono uppercase tracking-wide",
                  checkState.status === "valid" && "border-[var(--accent)]",
                )}
                placeholder="e.g. ALI10"
                autoComplete="off"
                maxLength={20}
                {...field}
                value={field.value ?? ""}
              />
            </div>
          </FormControl>
          <CheckStatusLine checkState={checkState} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
