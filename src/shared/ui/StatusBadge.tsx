import type { LeadStatus } from '@/lib/mockData';

const STATUS_MAP: Record<LeadStatus, { label: string; bg: string; color: string }> = {
  hot:      { label: 'Hot',      bg: 'linear-gradient(135deg,#EF4444,#F472B6)', color: 'white' },
  warm:     { label: 'Warm',     bg: 'linear-gradient(135deg,#F59E0B,#F97316)', color: 'white' },
  cold:     { label: 'Cold',     bg: 'linear-gradient(135deg,#38BDF8,#22D3EE)', color: 'white' },
  prospect: { label: 'Prospect', bg: 'rgba(148,163,184,0.25)',                  color: '#475569' },
  closed:   { label: 'Closed',   bg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: 'white' },
};

export function StatusBadge({ s }: { s: LeadStatus }) {
  const m = STATUS_MAP[s];
  return (
    <span className="badge" style={{ background: m.bg, color: m.color, fontWeight: 600 }}>
      {m.label}
    </span>
  );
}
