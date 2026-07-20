'use client';
import { useEffect, useMemo, useState } from 'react';
import { Download, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Dialog';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/utils';
import { STATUS_META } from '../types';
import type { Lead, LeadStatus } from '../types';

const CHANNEL_LABEL: Record<string, string> = { wa: 'WhatsApp', ig: 'Instagram', fb: 'Facebook', tk: 'TikTok' };

type StatusFilter = 'all' | LeadStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'prospect', label: 'Prospect' },
  { id: 'cold', label: 'Cold' },
  { id: 'warm', label: 'Warm' },
  { id: 'hot', label: 'Hot' },
];

function toCsv(rows: Lead[]): string {
  const headers = ['Name', 'Phone', 'Email', 'City', 'Channel', 'Status'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const l of rows) {
    lines.push([
      l.name,
      l.phone ?? '',
      l.email ?? '',
      l.city,
      CHANNEL_LABEL[l.channel] ?? l.channel,
      STATUS_META[l.status]?.label ?? l.status,
    ].map(esc).join(','));
  }
  return lines.join('\n');
}

function downloadCsv(csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportLeadsDialog({ open, onClose, leads }: {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) { setStatusFilter('all'); setSelected(new Set()); }
  }, [open]);

  const filtered = useMemo(
    () => (statusFilter === 'all' ? leads : leads.filter((l) => l.status === statusFilter)),
    [leads, statusFilter],
  );

  const filteredIds = useMemo(() => filtered.map((l) => l.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const selectedCount = selected.size;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filteredIds.forEach((id) => next.delete(id));
      else filteredIds.forEach((id) => next.add(id));
      return next;
    });

  const handleExport = () => {
    const rows = leads.filter((l) => selected.has(l.id));
    if (rows.length === 0) return;
    downloadCsv(toCsv(rows));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[620px] h-[min(640px,92vh)] overflow-hidden" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">Export leads</DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Filter by status, pick the leads you want, then export to CSV.
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
        </DialogHeader>

        {/* Status filters */}
        <div className="px-5 pt-3 flex-shrink-0 flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const meta = f.id !== 'all' ? STATUS_META[f.id] : null;
            const active = statusFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className="badge flex items-center gap-1.5 cursor-pointer font-medium py-[5px] px-3 border"
                style={{
                  background: active ? (meta?.color ?? 'var(--accent)') : (meta?.tint ?? 'var(--surface-2)'),
                  color: active ? 'white' : (meta?.color ?? 'var(--ink-soft)'),
                  borderColor: active ? (meta?.color ?? 'var(--accent)') : 'transparent',
                }}
              >
                {meta && <span className="dot w-1.5 h-1.5" style={{ background: active ? 'white' : meta.color }} />}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Select-all bar */}
        <div className="px-5 py-2.5 flex-shrink-0 flex items-center justify-between">
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer select-none">
            <input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="accent-[var(--accent)] w-4 h-4" />
            Select all {statusFilter !== 'all' ? `${FILTERS.find(f => f.id === statusFilter)?.label} ` : ''}({filtered.length})
          </label>
          <span className="text-[12px] text-[var(--ink-mute)]">{selectedCount} selected</span>
        </div>

        {/* List */}
        <div className="scroll flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-1">
          {filtered.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[12.5px] text-[var(--ink-mute)] py-10">
              No leads in this filter.
            </div>
          )}
          {filtered.map((l) => {
            const checked = selected.has(l.id);
            const st = STATUS_META[l.status];
            return (
              <label
                key={l.id}
                className={cn(
                  'flex items-center gap-2.5 rounded-[10px] border cursor-pointer px-2.5 py-2 transition-colors',
                  checked ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--line)] hover:bg-[var(--surface-2)]',
                )}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleOne(l.id)} className="accent-[var(--accent)] w-4 h-4 flex-shrink-0" />
                <CRMAvatar name={l.name} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{l.name}</div>
                  <div className="text-[11px] text-[var(--ink-mute)] truncate">{l.phone || l.email || l.city || '—'}</div>
                </div>
                <span className="badge py-px px-1.5 font-medium text-[10px]" style={{ background: st.tint, color: st.color }}>
                  {st.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--line)] flex-shrink-0">
          <span className="text-[12px] text-[var(--ink-soft)] flex items-center gap-1.5">
            {selectedCount > 0
              ? <><Check size={12} className="text-[#15803D]" /> {selectedCount} lead{selectedCount === 1 ? '' : 's'} ready</>
              : 'Select leads to export'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={selectedCount === 0} onClick={handleExport}>
              <Download size={13} /> Export {selectedCount || ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
