'use client';
import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { Plus, Upload, X, Check, Loader2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Dialog';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { extractErrorMessage } from '@/lib/utils';
import { useParseCsv, useBulkCreateLeads } from '../hooks/useLeads';
import { useLeadPhoneConflicts, type PhoneConflict } from '../hooks/useLeadPhoneConflicts';
import { Button } from '@/shared/ui/Button';
import { statusLabelForEnum, useLeadVocabulary, type LeadVocabulary } from '../utils/leadVocabulary';

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
  item, conflict, onSave, onDelete,
  vocabulary,
}: { item: LeadItem; conflict: PhoneConflict | null; onSave: (l: LeadItem) => void; onDelete: () => void; vocabulary: LeadVocabulary }) {
  const [draft, setDraft] = useState<LeadItem>(item);
  useEffect(() => { setDraft(item); }, [item]);

  const set = <K extends keyof LeadItem>(key: K, value: LeadItem[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const emailInvalid = !!draft.email?.trim() && !EMAIL_RE.test(draft.email.trim());
  const canApply = hasContact(draft) && !emailInvalid;

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <div className="text-[12px] font-semibold text-[var(--ink-mute)] uppercase tracking-wide mb-0.5">
        Edit {vocabulary.singular}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel}>Name</label>
        <input className={fieldInput} placeholder="Customer name" value={draft.name ?? ''} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel}>Phone</label>
        <input className={fieldInput} placeholder="+92 3XX XXXXXXX" value={draft.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
        {conflict && draft.phone === item.phone && (
          <p className={`text-[11.5px] ${conflict.blocking ? 'text-[#DC2626]' : 'text-[#B45309]'}`}>
            {conflict.message}
          </p>
        )}
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
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabelForEnum(vocabulary, s)}</option>)}
          </select>
        </div>
      </div>

      {!hasContact(draft) && (
        <p className="text-[11.5px] text-[#B45309]">Add a name, phone, or email.</p>
      )}

      <div className="flex gap-2 mt-auto pt-2 border-t border-[var(--line)]">
        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
          <X size={12} /> Remove
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1 justify-center"
          disabled={!canApply}
          onClick={() => canApply && onSave(draft)}
        >
          <Check size={12} /> Apply
        </Button>
      </div>
    </div>
  );
}

// ── Import mini-card ───────────────────────────────────────
function BulkCard({
  item, index, active, conflict, onClick, onRemove, vocabulary,
}: { item: LeadItem; index: number; active: boolean; conflict: PhoneConflict | null; onClick: () => void; onRemove: () => void; vocabulary: LeadVocabulary }) {
  const bad = !hasContact(item) || Boolean(conflict?.blocking);
  const display = item.name?.trim() || item.phone?.trim() || item.email?.trim() || `${vocabulary.singularTitle} ${index + 1}`;
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
        <div className={`text-[11px] truncate ${conflict ? (conflict.blocking ? 'text-[#DC2626]' : 'text-[#B45309]') : 'text-[var(--ink-mute)]'}`}>
          {conflict?.message || item.phone || item.email || item.city || '—'}
        </div>
      </div>
      <span className="badge py-px px-1.5 font-medium text-[10px]" style={{ background: st.tint, color: st.color }}>
        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
      </span>
      {bad && <div className="absolute top-1 left-1 px-1 py-px rounded-full text-[9px] font-bold text-white bg-[#EF4444]">!</div>}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-5 w-5"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
      >
        <X size={11} />
      </Button>
    </div>
  );
}

// ── Main Dialog ────────────────────────────────────────────
export function LeadsBulkImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const vocabulary = useLeadVocabulary();
  const [items, setItems] = useState<LeadItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCsv = useParseCsv();
  const bulkCreate = useBulkCreateLeads();
  const { verifyPhones, conflictsByIndex, resetConflicts, isVerifying } = useLeadPhoneConflicts();

  useEffect(() => { if (open) { setItems([]); setSelectedIdx(null); resetConflicts(); } }, [open, resetConflicts]);

  const conflicts = conflictsByIndex(items.map((item) => item.phone));
  const hasBlockingConflict = Object.values(conflicts).some((conflict) => conflict.blocking);

  const addItems = (newItems: LeadItem[]) => {
    setItems((prev) => {
      if (prev.length === 0 && newItems.length > 0) setSelectedIdx(0);
      return [...prev, ...newItems];
    });
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      // Strip the UTF-8 BOM that MS Excel prepends to "CSV UTF-8" exports —
      // otherwise the first header (e.g. "name") is read as "﻿name" and
      // that column is silently dropped on the server.
      const raw = (e.target?.result as string) ?? "";
      const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
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
        toast.success(`${mapped.length} ${mapped.length === 1 ? vocabulary.singular : vocabulary.plural} imported`);
        // Flag rows whose phone already belongs to an existing record before the user hits save.
        await verifyPhones(mapped.flatMap((lead) => (lead.phone ? [lead.phone] : [])));
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

  const valid = items.length > 0 && items.every(hasContact) && !hasBlockingConflict;
  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;

  const handleSaveAll = async () => {
    if (!valid) return;
    try {
      // Re-check: rows edited since the last verification may have picked up a conflict.
      const clear = await verifyPhones(items.flatMap((item) => (item.phone ? [item.phone] : [])));
      if (!clear) {
        toast.error(`Some ${vocabulary.plural} already exist — fix the highlighted rows.`);
        return;
      }
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
            <DialogTitle className="text-[16px] font-semibold">Bulk import {vocabulary.plural}</DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Upload a CSV or add manually. Select a card to edit, then save all.
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
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
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
              Browse
            </Button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = ''; }} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 gap-0">
          {/* Left: list */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--line)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-2 border-b border-[var(--line)]">
              <span className="text-[12px] text-[var(--ink-soft)]">
                {items.length === 0 ? `No ${vocabulary.plural} yet` : `${items.length} ${items.length === 1 ? vocabulary.singular : vocabulary.plural}`}
              </span>
              <Button variant="outline" size="sm" onClick={addBlank}>
                <Plus size={11} /> Add
              </Button>
            </div>
            <div className="scroll flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {items.map((item, i) => (
                <BulkCard
                  key={i} item={item} index={i}
                  active={selectedIdx === i}
                  conflict={conflicts[i] ?? null}
                  onClick={() => setSelectedIdx(i)}
                  onRemove={() => removeItem(i)}
                  vocabulary={vocabulary}
                />
              ))}
              {items.length === 0 && (
                <button
                  onClick={addBlank}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--line)] bg-[var(--surface-2)] min-h-[120px] cursor-pointer text-[var(--ink-mute)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Plus size={18} />
                  <span className="text-[11.5px] font-medium">Add {vocabulary.singular}</span>
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
                  conflict={conflicts[selectedIdx] ?? null}
                  onSave={(data) => updateItem(selectedIdx, data)}
                  onDelete={() => removeItem(selectedIdx)}
                  vocabulary={vocabulary}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--ink-mute)] p-6 text-center">
                <UserRound size={28} className="opacity-30" />
                <span className="text-[12.5px]">Select a {vocabulary.singular} card to edit it</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--line)] flex-shrink-0">
          <span className={`text-[12px] flex items-center gap-1.5 ${valid ? 'text-[var(--ink-soft)]' : 'text-[#B45309]'}`}>
            {bulkCreate.isPending
              ? <><Loader2 size={12} className="animate-spin text-[var(--accent)]" /> Saving {items.length} {items.length === 1 ? vocabulary.singular : vocabulary.plural}…</>
              : isVerifying
                ? <><Loader2 size={12} className="animate-spin text-[var(--accent)]" /> Checking for existing {vocabulary.plural}…</>
                : items.length > 0
                  ? valid
                    ? <><Check size={12} className="text-[#15803D]" /> All {items.length} ready to save</>
                    : hasBlockingConflict
                      ? `Some ${vocabulary.plural} already exist — fix the highlighted cards`
                      : `Some ${vocabulary.plural} need a name, phone, or email — click a card to edit`
                  : `Drop a CSV or click "Add ${vocabulary.singular}" to begin`}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={bulkCreate.isPending}>Cancel</Button>
            <Button disabled={!valid || bulkCreate.isPending || isVerifying} onClick={handleSaveAll}>
              {bulkCreate.isPending
                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                : <><Check size={13} /> Save {items.length || ''} {items.length === 1 ? vocabulary.singular : vocabulary.plural}</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
