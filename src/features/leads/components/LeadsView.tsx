'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search, Plus, Download, Layers, List, Grid2x2,
  MapPin, Inbox, Check, ChevronDown, X, Sparkles, Link,
} from 'lucide-react';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { ChannelBadge } from '@/shared/ui/ChannelBadge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Dialog';
import { cn, pkr } from '@/lib/utils';
import { useAppStore } from '@/lib/appStore';
import { useLeads, useAddLead, useUpdateLeadStatus, filterLeads } from '../hooks/useLeads';
import { STATUS_META } from '../types';
import type { Lead, LeadStatus, Channel } from '../types';
import type { LeadsView, LeadsFilter } from '../types';

// ──────────────────── Status Select ────────────────────
function StatusSelect({ value, onChange }: { value: LeadStatus; onChange: (s: LeadStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statusMeta = STATUS_META[value];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="badge flex items-center gap-1.5 cursor-pointer border font-medium py-[3px] px-[9px]"
        style={{ background: statusMeta.tint, color: statusMeta.color, borderColor: statusMeta.tint }}
      >
        <span className="dot w-[7px] h-[7px]" style={{ background: statusMeta.color }} />
        {statusMeta.label}
        <ChevronDown size={10} strokeWidth={2.4} />
      </button>
      {open && (
        <div className="card-2 fade-up absolute left-0 top-[calc(100%+4px)] z-40 p-1 min-w-[140px] bg-[var(--surface)]">
          {Object.entries(STATUS_META).map(([k, v]) => (
            <button
              key={k}
              onClick={() => { onChange(k as LeadStatus); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs hover:bg-[var(--surface-2)] transition-colors"
            >
              <span className="dot w-2 h-2" style={{ background: v.color }} />
              <span className="flex-1 text-[var(--ink)]">{v.label}</span>
              {value === k && <Check size={12} className="text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────── Lead Card (Kanban) ────────────────────
function LeadCard({
  lead, onClick, draggable, dragging,
  onDragStart, onDragEnd, onStatusChange,
}: {
  lead: Lead;
  onClick: () => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onStatusChange?: (s: LeadStatus) => void;
}) {
  return (
    <div
      className={cn(
        'card kanban-card flex flex-col gap-2 p-[11px]',
        dragging ? 'dragging' : '',
        draggable ? 'cursor-grab' : 'cursor-pointer',
        lead.status === 'hot'
          ? 'border-[#FCA5A5] bg-[rgba(254,242,242,0.6)]'
          : 'border-[var(--line)] bg-[var(--surface)]',
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <CRMAvatar name={lead.name} size={30} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[13px] text-[var(--ink)]">{lead.name}</div>
          <div className="text-[11px] text-[var(--ink-mute)]">{lead.city} · {lead.time}</div>
        </div>
        {lead.status === 'hot' && <span className="dot dot-hot pulse-hot" />}
      </div>
      <div className="text-[12px] truncate text-[var(--ink-soft)]">{lead.lastMsg}</div>
      <div className="flex items-center justify-between gap-1.5">
        <ChannelBadge channel={lead.channel} size="xs" />
        {lead.value > 0 && (
          <span className="entity-chip entity-money">{pkr(lead.value)}</span>
        )}
      </div>
    </div>
  );
}

// ──────────────────── Kanban View ────────────────────
function KanbanView({
  leads, filter, onSelect, onStatusChange,
}: {
  leads: Lead[];
  filter: LeadsFilter;
  onSelect: (l: Lead) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const filtered = filterLeads(leads, filter);
    const g: Record<string, Lead[]> = { prospect: [], cold: [], warm: [], hot: [] };
    filtered.forEach(l => { g[l.status]?.push(l); });
    return g;
  }, [leads, filter]);

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    onStatusChange(id, colKey as LeadStatus);
    setDraggingId(null);
  };

  return (
    <div className="leads-kanban grid gap-3 flex-1 min-h-0 grid-cols-[repeat(4,minmax(0,1fr))]">
      {Object.entries(STATUS_META).map(([key, c]) => (
        <div
          key={key}
          className={cn(
            'card kanban-col flex flex-col min-h-0 p-3',
            dragOverCol === key ? 'drag-over bg-[var(--accent-soft)]' : 'bg-[var(--surface)]',
          )}
          onDragOver={e => { e.preventDefault(); setDragOverCol(key); }}
          onDragLeave={() => setDragOverCol(prev => prev === key ? null : prev)}
          onDrop={e => handleDrop(e, key)}
        >
          <div className="flex items-center justify-between mb-2.5 px-1 pb-2 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <span className="dot w-2 h-2" style={{ background: c.color }} />
              <h4 className="text-[13px] font-semibold">{c.label}</h4>
              <span className="badge font-medium py-[1px] px-[7px]" style={{ background: c.tint, color: c.color }}>
                {grouped[key]?.length ?? 0}
              </span>
            </div>
            <button className="btn btn-ghost p-1" title="Add to column">
              <Plus size={13} />
            </button>
          </div>
          <div className="scroll overflow-y-auto flex flex-col gap-2 pr-0.5 min-h-[80px]">
            {grouped[key]?.map(l => (
              <LeadCard
                key={l.id}
                lead={l}
                onClick={() => onSelect(l)}
                draggable
                dragging={draggingId === l.id}
                onDragStart={e => {
                  e.dataTransfer.setData('text/plain', l.id);
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggingId(l.id);
                }}
                onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                onStatusChange={s => onStatusChange(l.id, s)}
              />
            ))}
            {(grouped[key]?.length ?? 0) === 0 && (
              <div className="p-5 text-center text-[12px] rounded-[10px] border border-dashed text-[var(--ink-mute)] border-[var(--line)]">
                Drop a lead here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────── Table View ────────────────────
function TableView({
  leads, filter, onSelect, onStatusChange,
}: {
  leads: Lead[];
  filter: LeadsFilter;
  onSelect: (l: Lead) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
}) {
  const filtered = useMemo(() => filterLeads(leads, filter), [leads, filter]);

  return (
    <div className="card overflow-auto flex-1 min-h-0">
      <table className="tbl">
        <thead>
          <tr>
            <th className="min-w-[200px]">Name</th>
            <th>Channel</th>
            <th>Status</th>
            <th>City</th>
            <th>Last activity</th>
            <th className="text-right">Est. value</th>
            <th>Health</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(l => (
            <tr key={l.id} onClick={() => onSelect(l)} className="cursor-pointer">
              <td>
                <div className="flex items-center gap-2.5">
                  <CRMAvatar name={l.name} size={30} />
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-[11px] text-[var(--ink-mute)]">
                      {l.lastMsg.length > 40 ? l.lastMsg.slice(0, 40) + '…' : l.lastMsg}
                    </div>
                  </div>
                </div>
              </td>
              <td><ChannelBadge channel={l.channel} size="xs" /></td>
              <td>
                <StatusSelect value={l.status} onChange={s => onStatusChange(l.id, s)} />
              </td>
              <td className="text-[var(--ink-soft)]">{l.city}</td>
              <td className="text-[var(--ink-mute)] text-[12px]">{l.time} ago</td>
              <td className="text-right font-[var(--font-mono)] font-medium">
                {l.value > 0 ? pkr(l.value) : <span className="text-[var(--ink-mute)]">—</span>}
              </td>
              <td>
                <div className="flex items-center gap-1.5">
                  <div className="h-[5px] w-[60px] rounded-full overflow-hidden bg-[var(--line)]">
                    <div className="h-full bg-[var(--accent)]" style={{ width: `${l.health}%` }} />
                  </div>
                  <span className="text-[11px] text-[var(--ink-mute)] font-[var(--font-mono)] min-w-[22px]">
                    {l.health}
                  </span>
                </div>
              </td>
              <td className="text-right" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost p-1.5" title="Open chat"><Inbox size={13} /></button>
                <button className="btn btn-ghost p-1.5" title="More"><List size={13} /></button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-[var(--ink-mute)] p-8">
                No matching leads.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ──────────────────── List View ────────────────────
function ListView({
  leads, filter, onSelect, onStatusChange,
}: {
  leads: Lead[];
  filter: LeadsFilter;
  onSelect: (l: Lead) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
}) {
  const filtered = useMemo(() => filterLeads(leads, filter), [leads, filter]);

  return (
    <div className="scroll flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
      {filtered.map(l => {
        const statusMeta = STATUS_META[l.status];
        return (
          <div
            key={l.id}
            className="card flex items-center gap-3.5 cursor-pointer p-3"
            onClick={() => onSelect(l)}
            style={{ borderLeft: `3px solid ${statusMeta.color}` }}
          >
            <CRMAvatar name={l.name} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[14px]">{l.name}</span>
                <ChannelBadge channel={l.channel} size="xs" />
                {l.status === 'hot' && <span className="dot dot-hot pulse-hot" />}
              </div>
              <div className="text-[12.5px] mt-0.5 truncate text-[var(--ink-soft)]">{l.lastMsg}</div>
              <div className="text-[11px] mt-1 flex items-center gap-2 text-[var(--ink-mute)]">
                <span className="inline-flex items-center gap-1"><MapPin size={10} />{l.city}</span>
                <span>·</span>
                <span>{l.time} ago</span>
                {l.value > 0 && (
                  <>
                    <span>·</span>
                    <span className="font-[var(--font-mono)] text-[var(--ink-soft)]">{pkr(l.value)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">Health</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-[60px] h-[5px] rounded-full overflow-hidden bg-[var(--line)]">
                    <div className="h-full bg-[var(--accent)]" style={{ width: `${l.health}%` }} />
                  </div>
                  <span className="text-[11px] font-[var(--font-mono)]">{l.health}</span>
                </div>
              </div>
              <StatusSelect value={l.status} onChange={s => onStatusChange(l.id, s)} />
              <button className="btn btn-outline py-[5px] px-[10px]">
                <Inbox size={12} /> Open
              </button>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="card p-10 text-center text-[var(--ink-mute)]">No matching leads.</div>
      )}
    </div>
  );
}

// ──────────────────── Add Lead Dialog ────────────────────
const addLeadSchema = z.object({
  name: z.string().min(1, 'Name required'),
  city: z.string(),
  channel: z.enum(['wa', 'ig', 'fb', 'tk']),
  status: z.enum(['prospect', 'cold', 'warm', 'hot']),
  phone: z.string().optional(),
  value: z.union([z.string(), z.number()]).transform(v => typeof v === 'string' ? (v === '' ? 0 : Number(v)) : v).pipe(z.number().min(0)).optional(),
  lastMsg: z.string().optional(),
});
type AddLeadData = z.output<typeof addLeadSchema>;
type AddLeadInput = z.input<typeof addLeadSchema>;

function AddLeadDialog({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}) {
  const form = useForm<AddLeadInput, unknown, AddLeadData>({
    resolver: zodResolver(addLeadSchema),
    defaultValues: { name: '', city: 'Lahore', channel: 'wa', status: 'warm', phone: '', value: 0, lastMsg: '' },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const onSubmit = (data: AddLeadData) => {
    const newLead: Lead = {
      id: `L${Date.now() % 100000}`,
      name: data.name.trim(),
      city: data.city,
      channel: data.channel as Channel,
      status: data.status as LeadStatus,
      lastMsg: data.lastMsg || 'New lead — no messages yet',
      time: 'just now',
      unread: 0,
      value: data.value ?? 0,
      intent: data.status === 'hot' ? 'checkout' : 'browse',
      health: data.status === 'hot' ? 80 : data.status === 'warm' ? 60 : data.status === 'cold' ? 35 : 20,
    };
    onSave(newLead);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="flex flex-col gap-0 p-0 sm:max-w-[500px] max-h-[90vh] overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-4 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">Add new lead</DialogTitle>
            <DialogDescription className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
              Manually create a lead — channel sync will fill the rest.
            </DialogDescription>
          </div>
          <button className="btn btn-ghost p-1.5 flex-shrink-0" onClick={onClose}><X size={18} /></button>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
            <div className="p-5 flex flex-col gap-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer name *</FormLabel>
                  <FormControl><input className="input" placeholder="Ali Hassan" autoFocus {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-2.5">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <select className="input" {...field}>
                        {['Lahore','Karachi','Islamabad','Faisalabad','Multan','Peshawar','Rawalpindi','Sialkot','Quetta'].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="channel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <FormControl>
                      <select className="input" {...field}>
                        <option value="wa">WhatsApp</option>
                        <option value="ig">Instagram</option>
                        <option value="fb">Facebook</option>
                        <option value="tk">TikTok</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => field.onChange(k)}
                          className="badge flex items-center gap-1.5 cursor-pointer font-medium py-[5px] px-3"
                          style={{
                            background: field.value === k ? v.color : v.tint,
                            color: field.value === k ? 'white' : v.color,
                            border: `1px solid ${field.value === k ? v.color : 'transparent'}`,
                          }}
                        >
                          <span className="dot w-1.5 h-1.5" style={{ background: field.value === k ? 'white' : v.color }} />
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-2.5">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><input className="input" placeholder="+92 321 ..." {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected value (PKR)</FormLabel>
                    <FormControl><input className="input" type="number" placeholder="0" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="lastMsg" render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial note</FormLabel>
                  <FormControl>
                    <textarea className="input" rows={2} placeholder="What did they ask about?" {...field} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-[var(--line)]">
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-grad">
                <Plus size={13} /> Add lead
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────── Lead Detail Sheet ────────────────────
function LeadDetailSheet({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  if (!lead) return null;
  const statusMeta = STATUS_META[lead.status];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[420px] z-[70]">
        <div className="relative p-[18px] border-b border-[var(--line)]">
          <button className="btn btn-ghost absolute top-2.5 right-2.5 p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <CRMAvatar name={lead.name} size={52} ring />
            <div>
              <h3 className="text-[17px] font-semibold">{lead.name}</h3>
              <div className="flex gap-1.5 items-center mt-1">
                <span
                  className="badge font-medium flex items-center gap-1.5 py-[3px] px-[9px]"
                  style={{ background: statusMeta.tint, color: statusMeta.color, border: `1px solid ${statusMeta.tint}` }}
                >
                  <span className="dot w-[7px] h-[7px]" style={{ background: statusMeta.color }} />
                  {statusMeta.label}
                </span>
                <ChannelBadge channel={lead.channel} />
              </div>
              <div className="text-[11.5px] mt-1 flex items-center gap-1 text-[var(--ink-mute)]">
                <MapPin size={11} /> {lead.city}, Pakistan
              </div>
            </div>
          </div>
        </div>
        <div className="scroll flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Lead Score', v: `${lead.health}/100` },
              { l: 'Lifetime Value', v: pkr(lead.value || 0) },
              { l: 'Last Active', v: `${lead.time} ago` },
              { l: 'Channel', v: lead.channel.toUpperCase() },
            ].map((k, i) => (
              <div key={i} className="card p-[11px]">
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
                  {k.l}
                </div>
                <div className="font-semibold text-[17px] mt-1 text-[var(--ink)] font-[var(--font-head)]">
                  {k.v}
                </div>
              </div>
            ))}
          </div>
          <div className="card p-3 bg-[var(--surface-2)]">
            <div className="text-[11px] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5 text-[var(--ink-mute)]">
              <Sparkles size={11} className="text-[var(--accent)]" /> AI-Suggested Next Action
            </div>
            <div className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
              Send a personalized checkout link with a 5% bundle discount on Lawn Suit 3-pc. High intent + repeat buyer; est. conversion:{' '}
              <b className="text-[#15803D]">78%</b>.
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-3.5 border-t border-[var(--line)]">
          <button className="btn btn-outline flex-1 justify-center"><Inbox size={14} /> Open Chat</button>
          <button className="btn btn-grad flex-[2] justify-center"><Link size={14} /> Generate Checkout</button>
        </div>
      </div>
    </>
  );
}

// ──────────────────── LeadsView (root) ────────────────────
export function LeadsView() {
  const { data: leads = [], isLoading } = useLeads();
  const addLead = useAddLead();
  const updateStatus = useUpdateLeadStatus();
  const { leadsView, setLeadsView } = useAppStore();

  const [filter, setFilter] = useState<LeadsFilter>({ channel: 'all', search: '' });
  const [selected, setSelected] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const hot = leads.filter(l => l.status === 'hot').length;
  const totalValue = leads.reduce((a, l) => a + (l.value || 0), 0);

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateStatus.mutate({ id, status });
  };

  const VIEW_BTNS: { id: LeadsView; label: string; Icon: React.ElementType }[] = [
    { id: 'kanban', label: 'Kanban', Icon: Layers },
    { id: 'list',   label: 'List',   Icon: List },
    { id: 'table',  label: 'Table',  Icon: Grid2x2 },
  ];

  const CHANNEL_TABS = [
    { id: 'all', label: 'All' },
    { id: 'wa',  label: 'WhatsApp' },
    { id: 'ig',  label: 'Instagram' },
    { id: 'fb',  label: 'Facebook' },
  ];

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="page-header flex items-center justify-between gap-3.5 flex-wrap">
        <div>
          <h2 className="text-[20px] font-semibold">Leads pipeline</h2>
          <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
            {leads.length} leads · {hot} hot · {pkr(totalValue)} projected
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Download size={13} /> Export</button>
          <button className="btn btn-grad" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Add lead
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card leads-toolbar flex items-center gap-2 flex-wrap p-2">
        <div className="relative flex-[1_1_220px] min-w-[200px]">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[var(--ink-mute)]" />
          <input
            className="input pl-8"
            placeholder="Search leads..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <div className="seg">
          {CHANNEL_TABS.map(c => (
            <button
              key={c.id}
              className={filter.channel === c.id ? 'on' : ''}
              onClick={() => setFilter(f => ({ ...f, channel: c.id as LeadsFilter['channel'] }))}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="seg">
          {VIEW_BTNS.map(({ id, label, Icon }) => (
            <button key={id} className={leadsView === id ? 'on' : ''} onClick={() => setLeadsView(id)} title={label}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-[var(--ink-mute)]">
          Loading leads…
        </div>
      )}

      {!isLoading && leadsView === 'kanban' && (
        <KanbanView leads={leads} filter={filter} onSelect={setSelected} onStatusChange={handleStatusChange} />
      )}
      {!isLoading && leadsView === 'list' && (
        <ListView leads={leads} filter={filter} onSelect={setSelected} onStatusChange={handleStatusChange} />
      )}
      {!isLoading && leadsView === 'table' && (
        <TableView leads={leads} filter={filter} onSelect={setSelected} onStatusChange={handleStatusChange} />
      )}

      <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />
      <AddLeadDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={lead => addLead.mutate(lead)}
      />
    </div>
  );
}
