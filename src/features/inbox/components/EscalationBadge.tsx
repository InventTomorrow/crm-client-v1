import { Check, Flame } from "lucide-react";

export function EscalationBadge({ status }: { status: string }) {
  if (status === "ESCALATED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#EF4444] bg-[#FEF2F2] px-1.5 py-0.5 rounded-full">
        <Flame size={9} /> Needs Attention
      </span>
    );
  }
  if (status === "RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">
        <Check size={9} /> Done
      </span>
    );
  }
  return null;
}
