import { cn } from "@/lib/utils";
import { Ticket } from "lucide-react";

/** Tells the customer their referral code is already part of the shown price. */
export function ReferralAppliedNote({
  code,
  discountPercent,
  className,
}: {
  code: string;
  discountPercent: number | null | undefined;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-1 text-[11.5px] font-medium text-success-foreground",
        className,
      )}
    >
      <Ticket size={12} />
      Code <span className="font-mono">{code}</span> applied
      {discountPercent ? ` (${discountPercent}% off)` : ""}
    </p>
  );
}
