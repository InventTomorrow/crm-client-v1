"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LeadStatus } from "../types";
import { STATUS_META } from "../types";

// ──────────────────── Status Select ────────────────────
export default function LeadStatusSelect({
  value,
  onChange,
}: {
  value: LeadStatus;
  onChange: (s: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statusMeta = STATUS_META[value];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setOpen((v) => !v)}
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
      {open && (
        <div className="card-2 fade-up absolute left-0 top-[calc(100%+4px)] z-40 p-1 min-w-[140px] bg-[var(--surface)]">
          {Object.entries(STATUS_META).map(([k, v]) => (
            <button
              key={k}
              onClick={() => {
                onChange(k as LeadStatus);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs hover:bg-[var(--surface-2)] transition-colors"
            >
              <span className="dot w-2 h-2" style={{ background: v.color }} />
              <span className="flex-1 text-[var(--ink)]">{v.label}</span>
              {value === k && (
                <Check size={12} className="text-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
