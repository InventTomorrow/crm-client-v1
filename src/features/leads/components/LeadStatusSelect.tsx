"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { LeadStatus } from "../types";
import { useLeadVocabulary } from "../utils/leadVocabulary";

// ──────────────────── Status Select ────────────────────
// The list renders in a portal, so a short table or a scroll container can never clip it.
export default function LeadStatusSelect({
  value,
  onChange,
}: {
  value: LeadStatus;
  onChange: (s: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const { statusMeta: statusMetaByStatus } = useLeadVocabulary();
  const statusMeta = statusMetaByStatus[value];

  return (
    // Portal clicks still bubble through React, so this keeps them from opening the row.
    <div className="inline-block" onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="badge flex items-center gap-1.5 cursor-pointer border font-medium py-[3px] px-[9px]"
            style={{
              background: statusMeta.tint,
              color: statusMeta.color,
              borderColor: statusMeta.tint,
            }}
          >
            <span
              className="dot w-[7px] h-[7px]"
              style={{ background: statusMeta.color }}
            />
            {statusMeta.label}
            <ChevronDown size={10} strokeWidth={2.4} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          collisionPadding={8}
          className="w-auto min-w-[140px] gap-0 p-1 bg-[var(--surface)]"
        >
          {Object.entries(statusMetaByStatus).map(([status, meta]) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                onChange(status as LeadStatus);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs hover:bg-[var(--surface-2)] transition-colors"
            >
              <span className="dot w-2 h-2" style={{ background: meta.color }} />
              <span className="flex-1 text-[var(--ink)]">{meta.label}</span>
              {value === status && (
                <Check size={12} className="text-[var(--accent)]" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
