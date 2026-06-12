'use client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Search, Plus, Download, Users, Check, Mail, Lock, Trash2,
  Pencil, Send, MoreHorizontal, Package, Flame, Shield, X,
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Dialog';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/appStore';
import { inviteUserSchema, ROLE_META, STATUS_META, ROLE_PERMISSIONS } from '../types';
import type { InviteUserData, RoleFilter, StatusFilter } from '../types';
import type { TeamUser } from '../types';

// ──────────────────── Role Badge ────────────────────
function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] ?? ROLE_META.Agent;
  return <span className="badge font-medium" style={{ background: m.bg, color: m.color }}>{role}</span>;
}

// ──────────────────── Status Badge ────────────────────
function UserStatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.active;
  return (
    <span className="badge font-medium flex items-center gap-1.5" style={{ background: m.bg, color: m.color }}>
      <span className="dot w-1.5 h-1.5" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

// ──────────────────── Invite User Dialog ────────────────────
function InviteUserDialog({ open, editing, onClose, onSave }: {
  open: boolean;
  editing?: TeamUser | null;
  onClose: () => void;
  onSave: (data: InviteUserData & { id?: string }) => void;
}) {
  const form = useForm<InviteUserData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { name: '', email: '', role: 'Agent', city: 'Lahore', phone: '' },
  });

  const role = form.watch('role');

  // Reset when dialog opens/editing changes
  useState(() => {
    if (open) {
      form.reset(editing
        ? { name: editing.name, email: editing.email, role: editing.role as 'Owner' | 'Manager' | 'Agent', city: editing.city, phone: editing.phone ?? '' }
        : { name: '', email: '', role: 'Agent', city: 'Lahore', phone: '' });
    }
  });

  const handleSubmit = (data: InviteUserData) => {
    onSave(editing ? { ...data, id: editing.id } : data);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[500px] max-h-[90vh] overflow-hidden" showCloseButton={false}>
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-4 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[17px] font-semibold">{editing ? 'Edit team member' : 'Invite team member'}</DialogTitle>
            <DialogDescription className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
              {editing ? 'Update role and details' : "They'll receive an email invite to join your workspace"}
            </DialogDescription>
          </div>
          <button className="btn btn-ghost p-1.5" onClick={onClose}><X size={18} /></button>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="overflow-y-auto flex-1">
            <div className="p-5 flex flex-col gap-3.5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl><input className="input" placeholder="Ali Hassan" autoFocus {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Work email</FormLabel>
                  <FormControl>
                    <input className="input" type="email" placeholder="ali@saleflow.pk" disabled={!!editing} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select className="input" {...field}>
                        <option>Owner</option>
                        <option>Manager</option>
                        <option>Agent</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <select className="input" {...field}>
                        {['Lahore','Karachi','Islamabad','Faisalabad','Multan','Peshawar','Rawalpindi'].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl><input className="input" placeholder="+92 321 4567890" {...field} /></FormControl>
                </FormItem>
              )} />
              <div className="card p-3 bg-[var(--surface-2)]">
                <div className="text-[11px] uppercase tracking-wider font-semibold mb-2 text-[var(--ink-mute)]">
                  {role} permissions
                </div>
                <div className="flex flex-col gap-1 text-[12.5px] text-[var(--ink-soft)]">
                  {(ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.Agent).map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check size={12} className="text-[#15803D]" /> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-[var(--line)]">
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-grad">
                {editing ? <><Check size={14} /> Save changes</> : <><Send size={14} /> Send invitation</>}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────── Row Action Menu ────────────────────
function RowMenu({ user, onEdit, onToggle, onDelete, onResend, onClose }: {
  user: TeamUser;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onResend?: () => void;
  onClose: () => void;
}) {
  const isOwner = user.role === 'Owner';

  const items: { label: string; Icon: React.ElementType; onClick: () => void; danger?: boolean; disabled?: boolean }[] = [
    { label: 'Edit', Icon: Pencil, onClick: onEdit },
    ...(user.status === 'invited' ? [{ label: 'Resend invite', Icon: Send, onClick: onResend ?? onClose }] : []),
    { label: user.status === 'active' ? 'Disable' : 'Enable', Icon: Lock, onClick: onToggle, disabled: isOwner },
    { label: 'Remove', Icon: Trash2, onClick: onDelete, danger: true, disabled: isOwner },
  ];

  return (
    <div className="card-2 fade-up absolute right-0 top-[110%] z-30 p-1.5 min-w-[200px] bg-[var(--surface)]"
      onClick={e => e.stopPropagation()}>
      {items.map((item, i) => {
        if (item.label === 'Remove' && i > 0) {
          return (
            <div key={item.label}>
              <div className="h-px mx-1 my-1 bg-[var(--line)]" />
              <button
                disabled={item.disabled}
                onClick={item.disabled ? undefined : item.onClick}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] transition-colors hover:bg-[rgba(239,68,68,0.08)]',
                  item.disabled ? 'text-[var(--ink-mute)] opacity-50' : 'text-[#DC2626]',
                )}
              >
                <item.Icon size={13} /> {item.label}
              </button>
            </div>
          );
        }
        return (
          <button
            key={item.label}
            disabled={item.disabled}
            onClick={item.disabled ? undefined : item.onClick}
            className={cn(
              'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] transition-colors hover:bg-[var(--surface-2)]',
              item.disabled ? 'text-[var(--ink-mute)] opacity-50' : 'text-[var(--ink)]',
            )}
          >
            <item.Icon size={13} /> {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────── Activity log data ────────────────────
const ACTIVITY = [
  { who: 'Sara Khan',   what: 'updated inventory price for', target: 'Lawn Suit 3-pc',           when: '12 min ago', Icon: Package },
  { who: 'Bilal Iqbal', what: 'closed a hot lead',          target: 'Nida Sheikh (Rs. 22,500)',  when: '1 hour ago', Icon: Flame },
  { who: 'Hira Anwar',  what: 'invited',                    target: 'kashif@saleflow.pk',        when: '3 hours ago', Icon: Send },
  { who: 'Ahmed Raza',  what: 'changed permissions for',    target: 'Sara Khan (Manager)',       when: '1 day ago',  Icon: Shield },
  { who: 'Sara Khan',   what: 'exported analytics report',  target: 'May 2026 funnel.csv',       when: '2 days ago', Icon: Download },
];

// ──────────────────── AdminView (root) ────────────────────
export function AdminView() {
  const { teamUsers, saveTeamUser, toggleTeamUserStatus, deleteTeamUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [roleF, setRoleF] = useState<RoleFilter>('all');
  const [statusF, setStatusF] = useState<StatusFilter>('all');
  const [openInvite, setOpenInvite] = useState(false);
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total:    teamUsers.length,
    active:   teamUsers.filter(u => u.status === 'active').length,
    invited:  teamUsers.filter(u => u.status === 'invited').length,
    disabled: teamUsers.filter(u => u.status === 'disabled').length,
  }), [teamUsers]);

  const filtered = useMemo(() => teamUsers.filter(u => {
    if (search && !`${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleF !== 'all' && u.role !== roleF) return false;
    if (statusF !== 'all' && u.status !== statusF) return false;
    return true;
  }), [teamUsers, search, roleF, statusF]);

  const handleSave = (data: InviteUserData & { id?: string }) => {
    const now = new Date().toISOString().slice(0, 10);
    if (data.id) {
      saveTeamUser({ ...(teamUsers.find(u => u.id === data.id) as TeamUser), ...data });
    } else {
      saveTeamUser({
        id: `U${Date.now() % 100000}`,
        name: data.name,
        email: data.email,
        role: data.role,
        city: data.city,
        phone: data.phone ?? '',
        status: 'invited',
        last: '—',
        joined: now,
      });
    }
    setOpenInvite(false);
    setEditing(null);
  };

  const STAT_CARDS = [
    { label: 'Total members',   v: stats.total,    Icon: Users,    color: 'var(--accent)' },
    { label: 'Active',          v: stats.active,   Icon: Check,    color: '#15803D' },
    { label: 'Pending invites', v: stats.invited,  Icon: Mail,     color: '#B45309' },
    { label: 'Disabled',        v: stats.disabled, Icon: Lock,     color: '#64748B' },
  ];

  const ROLE_TABS: { id: RoleFilter; label: string }[] = [
    { id: 'all', label: 'All roles' }, { id: 'Owner', label: 'Owners' },
    { id: 'Manager', label: 'Managers' }, { id: 'Agent', label: 'Agents' },
  ];
  const STATUS_TABS: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'active', label: 'Active' },
    { id: 'invited', label: 'Pending' }, { id: 'disabled', label: 'Disabled' },
  ];

  return (
    <div
      className="scroll overflow-y-auto h-full p-[18px]"
      onClick={() => setMenuFor(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-3 flex-wrap">
        <div>
          <h2 className="text-[20px] font-semibold">Team &amp; Access</h2>
          <div className="text-[12.5px] mt-0.5 text-[var(--ink-mute)]">
            Manage who can sign in to your AsaanRabta workspace and what they can do.
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Download size={14} /> Export</button>
          <button className="btn btn-grad" onClick={() => { setEditing(null); setOpenInvite(true); }}>
            <Plus size={14} /> Invite member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-3.5">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="card flex items-center gap-3 p-[14px]">
            <span className="w-9 h-9 rounded-[10px] inline-flex items-center justify-center flex-shrink-0 bg-[var(--surface-2)] border border-[var(--line)]"
              style={{ color: s.color }}>
              <s.Icon size={16} />
            </span>
            <div>
              <div className="font-semibold leading-none text-[22px] text-[var(--ink)] font-[var(--font-head)]">
                {s.v}
              </div>
              <div className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card flex items-center gap-2.5 flex-wrap mb-3.5 p-2.5">
        <div className="relative min-w-[200px] flex-[1_1_240px]">
          <Search size={14} className="absolute left-3 top-[11px] text-[var(--ink-mute)]" />
          <input className="input pl-[34px]" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="seg">
          {ROLE_TABS.map(c => (
            <button key={c.id} className={roleF === c.id ? 'on' : ''} onClick={() => setRoleF(c.id)}>{c.label}</button>
          ))}
        </div>
        <div className="seg">
          {STATUS_TABS.map(c => (
            <button key={c.id} className={statusF === c.id ? 'on' : ''} onClick={() => setStatusF(c.id)}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="card overflow-hidden mb-4">
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th><th>Role</th><th>Status</th><th>City</th>
              <th>Last active</th><th>Joined</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <CRMAvatar name={u.name} size={32} />
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[11.5px] text-[var(--ink-mute)]">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><RoleBadge role={u.role} /></td>
                <td><UserStatusBadge status={u.status} /></td>
                <td className="text-[var(--ink-soft)]">{u.city}</td>
                <td className="text-[var(--ink-mute)] text-[12px]">{u.last}</td>
                <td className="text-[var(--ink-mute)] text-[11.5px] font-[var(--font-mono)]">{u.joined}</td>
                <td className="text-right">
                  <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost p-1.5" onClick={() => setMenuFor(menuFor === u.id ? null : u.id)}>
                      <MoreHorizontal size={14} />
                    </button>
                    {menuFor === u.id && (
                      <RowMenu
                        user={u}
                        onEdit={() => { setEditing(u); setOpenInvite(true); setMenuFor(null); }}
                        onToggle={() => { toggleTeamUserStatus(u.id); setMenuFor(null); }}
                        onDelete={() => { if (u.role !== 'Owner') deleteTeamUser(u.id); setMenuFor(null); }}
                        onResend={() => setMenuFor(null)}
                        onClose={() => setMenuFor(null)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-8 text-[var(--ink-mute)]">
                  No matching members.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Activity log */}
      <div className="card p-[18px]">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-[14px] font-semibold">Recent activity</h3>
            <div className="text-[12px] text-[var(--ink-mute)]">Last 7 days · audited</div>
          </div>
          <button className="btn btn-outline py-1.5 px-2.5"><Download size={12} /> Export log</button>
        </div>
        <div className="flex flex-col">
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              className={cn('flex items-center gap-3 py-2.5 px-1', i < ACTIVITY.length - 1 && 'border-b border-[var(--line-soft)]')}
            >
              <span className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center flex-shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]">
                <a.Icon size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px]">
                  <span className="font-medium">{a.who}</span>
                  <span className="text-[var(--ink-soft)]"> {a.what} </span>
                  <span className="font-medium">{a.target}</span>
                </div>
                <div className="text-[11px] mt-0.5 text-[var(--ink-mute)]">{a.when}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InviteUserDialog
        open={openInvite}
        editing={editing}
        onClose={() => { setOpenInvite(false); setEditing(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
