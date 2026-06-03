'use client';
import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { Plus, Upload, X, Check, Loader2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Dialog';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { extractErrorMessage } from '@/lib/utils';
import { useParseCsv, useBulkCreateLeads } from '../hooks/useLeads';

// Backend enum values (sent as-is to /leads/import/commit)
const CHANNELS = ['WHATSAPP', 'INSTAGRAM', 'MESSENGER'] as const;
const STATUSES = ['PROSPECT', 'COLD', 'WARM', 'HOT'] as const;

const STATUS_TINT: Record<string, { color: string; tint: string }> = {
  PROSPECT: { color: '#94A3B8', tint: 'rgba(148,163,184,0.12)' },
  COLD:     { color: '#38BDF8', tint: 'rgba(56,189,248,0.12)' },
  WARM:     { color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
  HOT:      { color: '#EF4444', tint: 'rgba(239,68,68,0.10)' },
};

// ── Schema ────────────────────────────────────────────────
const leadSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    city: z.string().optional(),
    channel: z.enum(CHANNELS),
    status: z.enum(STATUSES),
  })
  .refine((d) => Boolean(d.name?.trim() || d.phone?.trim() || d.email?.trim()), {
    message: 'Name, phone, or email is required',
    path: ['name'],
  });

type LeadItem = z.infer<typeof leadSchema>;

const EMPTY_ITEM = (): LeadItem => ({
  name: '', email: '', phone: '', city: '', channel: 'WHATSAPP', status: 'PROSPECT',
});

const hasContact = (l: LeadItem) => Boolean(l.name?.trim() || l.phone?.trim() || l.email?.trim());

// ── Inline Edit Panel (plain controlled state — no RHF) ────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldLabel = 'text-[11.5px] font-medium text-[var(--ink-soft)]';
const fieldInput = 'input text-[12.5px] py-1.5';

function EditPanel({
  item, onSave, onDelete,
}: { item: LeadItem; onSave: (l: LeadItem) => void; onDelete: () => void }) {
  const [draft, setDraft] = useState<LeadItem>(item);
  useEffect(() => { setDraft(item); }, [item]);

  const set = <K extends keyof LeadItem>(key: K, value: LeadItem[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const emailInvalid = !!draft.email?.trim() && !EMAIL_RE.test(draft.email.trim());
  const canApply = hasContact(draft) && !emailInvalid;

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <div className="text-[12px] font-semibold text-[var(--ink-mute)] uppercase tracking-wide mb-0.5">
        Edit lead
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel}>Name</label>
        <input className={fieldInput} placeholder="Customer name" value={draft.name ?? ''} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel}>Phone</label>
        <input className={fieldInput} placeholder="+92 3XX XXXXXXX" value={draft.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel}>Email</label>
        <input className={fieldInput} placeholder="name@example.com" value={draft.email ?? ''} onChange={(e) => set('email', e.target.value)} />
        {emailInvalid && <p className="text-[11.5px] text-[#DC2626]">Invalid email</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel}>City</label>
        <input className={fieldInput} placeholder="City" value={draft.city ?? ''} onChange={(e) => set('city', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabel}>Channel</label>
          <select className={fieldInput} value={draft.channel} onChange={(e) => set('channel', e.target.value as LeadItem['channel'])}>
            {CHANNELS.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabel}>Status</label>
          <select className={fieldInput} value={draft.status} onChange={(e) => set('status', e.target.value as LeadItem['status'])}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </div>

      {!hasContact(draft) && (
        <p className="text-[11.5px] text-[#B45309]">Add a name, phone, or email.</p>
      )}

      <div className="flex gap-2 mt-auto pt-2 border-t border-[var(--line)]">
        <button type="button" className="btn btn-ghost text-[#DC2626] text-[12px]" onClick={onDelete}>
          <X size={12} /> Remove
        </button>
        <button
          type="button"
          className="btn btn-grad text-[12px] flex-1 justify-center"
          disabled={!canApply}
          onClick={() => canApply && onSave(draft)}
        >
          <Check size={12} /> Apply
        </button>
      </div>
    </div>
  );
}

// ── Lead mini-card ─────────────────────────────────────────
function BulkCard({
  item, index, active, onClick, onRemove,
}: { item: LeadItem; index: number; active: boolean; onClick: () => void; onRemove: () => void }) {
  const bad = !hasContact(item);
  const display = item.name?.trim() || item.phone?.trim() || item.email?.trim() || `Lead ${index + 1}`;
  const st = STATUS_TINT[item.status] ?? STATUS_TINT.PROSPECT;
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-[10px] border cursor-pointer p-[9px] transition-all
        ${active ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : bad ? 'border-[#FCA5A5] bg-[var(--surface)]' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]'}`}
    >
      <CRMAvatar name={display} size={32} />
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium truncate">{display}</div>
        <div className="text-[11px] text-[var(--ink-mute)] truncate">
          {item.phone || item.email || item.city || '—'}
        </div>
      </div>
      <span className="badge py-px px-1.5 font-medium text-[10px]" style={{ background: st.tint, color: st.color }}>
        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
      </span>
      {bad && <div className="absolute top-1 left-1 px-1 py-px rounded-full text-[9px] font-bold text-white bg-[#EF4444]">!</div>}
      <button
        type="button"
        className="btn btn-ghost p-0.5"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ── Main Dialog ────────────────────────────────────────────
export function LeadsBulkImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<LeadItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCsv = useParseCsv();
  const bulkCreate = useBulkCreateLeads();

  useEffect(() => { if (open) { setItems([]); setSelectedIdx(null); } }, [open]);

  const addItems = (newItems: LeadItem[]) => {
    setItems((prev) => {
      if (prev.length === 0 && newItems.length > 0) setSelectedIdx(0);
      return [...prev, ...newItems];
    });
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = await parseCsv.mutateAsync(text);
        const mapped: LeadItem[] = parsed.map((p: any) => ({
          name: p.name ?? '',
          email: p.email ?? '',
          phone: p.phone ?? '',
          city: p.city ?? '',
          channel: (CHANNELS as readonly string[]).includes(p.channel) ? p.channel : 'WHATSAPP',
          status: (STATUSES as readonly string[]).includes(p.status) ? p.status : 'PROSPECT',
        }));
        addItems(mapped);
        toast.success(`${mapped.length} lead${mapped.length !== 1 ? 's' : ''} imported`);
      } catch (err) {
        toast.error(extractErrorMessage(err) || 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  };

  const updateItem = (idx: number, data: LeadItem) => setItems((prev) => prev.map((x, i) => (i === idx ? data : x)));

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setSelectedIdx((prev) => {
      if (prev === null) return null;
      if (prev === idx) return items.length > 1 ? Math.max(0, idx - 1) : null;
      return prev > idx ? prev - 1 : prev;
    });
  };

  const addBlank = () => {
    const idx = items.length;
    setItems((prev) => [...prev, EMPTY_ITEM()]);
    setSelectedIdx(idx);
  };

  const valid = items.length > 0 && items.every(hasContact);
  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;

  const handleSaveAll = async () => {
    if (!valid) return;
    try {
      await bulkCreate.mutateAsync(items);
      onClose();
    } catch { /* toast handled by hook */ }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !bulkCreate.isPending) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[860px] h-[min(680px,92vh)] overflow-hidden" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">Bulk import leads</DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Upload a CSV or add manually. Select a card to edit, then save all.
            </DialogDescription>
          </div>
          <button className="btn btn-ghost p-1.5" onClick={onClose}><X size={18} /></button>
        </DialogHeader>

        {/* Drop zone */}
        <div className="px-5 pt-3 flex-shrink-0">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }}
            onClick={() => fileRef.current?.click()}
            className={`flex items-center gap-3 rounded-[10px] cursor-pointer transition-all py-3 px-4
              ${dragOver ? 'border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)]'}`}
          >
            <span className="w-8 h-8 rounded-[9px] inline-flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
              {parseCsv.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            </span>
            <div className="flex-1 text-[12.5px]">
              <span className="font-medium">Drop a CSV</span>
              <span className="text-[var(--ink-mute)]"> · columns: <code>name, phone, email, city, channel, status</code></span>
            </div>
            <button className="btn btn-outline text-[12px]" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
              Browse
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = ''; }} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 gap-0">
          {/* Left: list */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--line)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-2 border-b border-[var(--line)]">
              <span className="text-[12px] text-[var(--ink-soft)]">
                {items.length === 0 ? 'No leads yet' : `${items.length} lead${items.length > 1 ? 's' : ''}`}
              </span>
              <button className="btn btn-outline text-[11.5px] py-0.5 px-2" onClick={addBlank}>
                <Plus size={11} /> Add
              </button>
            </div>
            <div className="scroll flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {items.map((item, i) => (
                <BulkCard
                  key={i} item={item} index={i}
                  active={selectedIdx === i}
                  onClick={() => setSelectedIdx(i)}
                  onRemove={() => removeItem(i)}
                />
              ))}
              {items.length === 0 && (
                <button
                  onClick={addBlank}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)] min-h-[120px] cursor-pointer text-[var(--ink-mute)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Plus size={18} />
                  <span className="text-[11.5px] font-medium">Add lead</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: edit panel */}
          <div className="w-[300px] flex-shrink-0 flex flex-col overflow-hidden">
            {selectedItem !== null && selectedIdx !== null ? (
              <div className="scroll flex-1 overflow-y-auto p-4">
                <EditPanel
                  key={selectedIdx}
                  item={selectedItem}
                  onSave={(data) => updateItem(selectedIdx, data)}
                  onDelete={() => removeItem(selectedIdx)}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--ink-mute)] p-6 text-center">
                <UserRound size={28} className="opacity-30" />
                <span className="text-[12.5px]">Select a lead card to edit it</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--line)] flex-shrink-0">
          <span className={`text-[12px] flex items-center gap-1.5 ${valid ? 'text-[var(--ink-soft)]' : 'text-[#B45309]'}`}>
            {bulkCreate.isPending
              ? <><Loader2 size={12} className="animate-spin text-[var(--accent)]" /> Saving {items.length} lead{items.length === 1 ? '' : 's'}…</>
              : items.length > 0
                ? valid
                  ? <><Check size={12} className="text-[#15803D]" /> All {items.length} ready to save</>
                  : 'Some leads need a name, phone, or email — click a card to edit'
                : 'Drop a CSV or click "Add lead" to begin'}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={onClose} disabled={bulkCreate.isPending}>Cancel</button>
            <button className="btn btn-grad" disabled={!valid || bulkCreate.isPending} onClick={handleSaveAll}>
              {bulkCreate.isPending
                ? <><span className="animate-spin inline-block h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" /> Saving…</>
                : <><Check size={13} /> Save {items.length || ''} lead{items.length === 1 ? '' : 's'}</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
