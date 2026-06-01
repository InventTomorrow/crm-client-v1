'use client';
import { useEffect } from 'react';
import { Flame, X, Link } from 'lucide-react';
import { pkr } from '@/lib/utils';
import type { Lead } from '@/lib/mockData';

interface HotToastProps {
  lead: Lead;
  onClose: () => void;
}

export function HotToast({ lead, onClose }: HotToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [lead, onClose]);

  return (
    <div className="card-2 toast-in fixed top-[72px] right-5 z-[90] w-[320px] bg-[var(--surface)] border-l-[3px] border-l-[#EF4444]">
      <div className="p-[14px]">
        <div className="flex items-start gap-3">
          <div className="pulse-hot w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.12)] text-[#DC2626] flex items-center justify-center flex-shrink-0">
            <Flame size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="badge bg-[rgba(239,68,68,0.10)] text-[#DC2626] font-semibold text-[10px] tracking-[0.06em]">HOT LEAD</span>
              <span className="text-[11px] text-[var(--ink-mute)]">just now</span>
            </div>
            <div className="font-[var(--font-head)] font-semibold text-[13.5px] mt-0.5">
              {lead.name} <span className="font-normal text-[var(--ink-mute)]">· {lead.city}</span>
            </div>
            <div className="text-[12px] text-[var(--ink-soft)] mt-1 leading-[1.5]">
              Trigger: checkout intent + phone shared · est. {pkr(lead.value || 17998)}
            </div>
          </div>
          <button className="btn btn-ghost p-1" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <button className="btn btn-grad w-full justify-center mt-3">
          <Link size={13} /> Send Checkout Link
        </button>
      </div>
    </div>
  );
}
