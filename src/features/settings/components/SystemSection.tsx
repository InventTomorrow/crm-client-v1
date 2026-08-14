"use client";
import { Activity, Cloud, Lock, Star } from "lucide-react";
import { SYSTEM_STATS } from "../types";

const SYSTEM_ICONS = [Star, Activity, Lock, Cloud] as const;

export function SystemSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">System Status</h2>
      <div className="card p-[22px] bg-[#0F172A] text-white border border-[rgba(255,255,255,0.08)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              All systems operational
            </h3>
            <div className="text-[12px] mt-1 text-[rgba(255,255,255,0.6)]">
              Last checked just now
            </div>
          </div>
          <span className="badge font-medium bg-[rgba(34,197,94,0.2)] text-[#86EFAC]">
            ● Healthy
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {SYSTEM_STATS.map((s, i) => {
            const Icon = SYSTEM_ICONS[i];
            return (
              <div
                key={i}
                className="rounded-[10px] p-3.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <Icon size={15} className="text-[#C4B5FD]" />
                  <span
                    className={`dot ${s.ok ? "bg-[#22C55E]" : "bg-[#EF4444]"}`}
                  />
                </div>
                <div className="font-semibold mt-2 text-[18px] font-[var(--font-head)]">
                  {s.v}
                </div>
                <div className="text-[11.5px] text-[rgba(255,255,255,0.65)]">
                  {s.l}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
