'use client';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  User, Bell, Link, Crown, Shield, Activity,
  Upload, Check, RefreshCw, Zap, Cloud, Lock, Sparkles,
  Users, Building2, Loader2, Bot, Store,
} from 'lucide-react';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { CRMSwitch } from '@/shared/ui/CRMSwitch';
import { ChannelBadge } from '@/shared/ui/ChannelBadge';
import { useAppStore } from '@/lib/appStore';
import { useMe, useUpdateMe } from '@/features/auth/hooks/useAuth';
import { usePresignedUpload } from '@/features/inventory/hooks/useProducts';
import { WorkspacesManagementView } from './WorkspacesManagementView';
import { ChatbotSection } from './ChatbotSection';
import { BusinessSection } from './BusinessSection';
import { SECTION_NAV, CHANNELS_DATA, SYSTEM_STATS } from '../types';
import type { SettingsSection } from '../types';
import type { NotifSettings } from '../types';

const SECTION_ICONS: Record<SettingsSection, React.ElementType> = {
  profile:    User,
  notif:      Bell,
  chatbot:    Bot,
  business:   Store,
  channels:   Link,
  tier:       Crown,
  access:     Shield,
  workspaces: Building2,
  system:     Activity,
};

// ──────────────────── Field (label wrapper) ────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold mb-1.5 text-[var(--ink-soft)]">{label}</label>
      {children}
    </div>
  );
}

// ──────────────────── Metric ────────────────────
function Metric({ label, v, pct }: { label: string; v: string; pct: number }) {
  return (
    <div className="card p-3 bg-[var(--surface)]">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">{label}</div>
      <div className="font-semibold mt-1 text-[18px] text-[var(--ink)] font-[var(--font-head)]">{v}</div>
      <div className="h-1 rounded-full overflow-hidden mt-2 bg-[var(--line)]">
        <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ──────────────────── Profile Section ────────────────────
function ProfileSection() {
  const { user, isLoading } = useMe();
  const { mutate: saveProfile, isPending: isSaving } = useUpdateMe();
  const { upload: uploadImage, isPending: isUploading } = usePresignedUpload('avatars');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  const [draft, setDraft] = useState({
    firstName: '',
    lastName:  '',
    phone:     '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      setDraft({
        firstName: user.firstName ?? '',
        lastName:  user.lastName  ?? '',
        phone:     user.phone ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
    }
  }, [user]);

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Your Name';
  const displayEmail = user?.email ?? '';
  const currentMembership = user?.memberships?.[0];
  const workspaceName = currentMembership?.tenant?.name ?? '';
  const roleName      = currentMembership?.role?.name  ?? '';

  const originalDraft = {
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    phone:     user?.phone ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  };
  const dirty = JSON.stringify(originalDraft) !== JSON.stringify(draft);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const url = await uploadImage(file);
      setDraft(d => ({ ...d, avatarUrl: url }));
      saveProfile({ avatarUrl: url });
    } catch {
      // error toast already shown by usePresignedUpload's onError
    }
  };

  const handleSave = () => {
    saveProfile(
      {
        firstName: draft.firstName || undefined,
        lastName:  draft.lastName  || undefined,
        phone:     draft.phone     || undefined,
        avatarUrl: draft.avatarUrl || undefined,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-semibold">Profile</h2>
      <div className="card p-[22px]">
        <div className="flex items-center gap-4 mb-5">
          <CRMAvatar name={fullName} src={draft.avatarUrl || null} size={64} ring />
          <div>
            <h4 className="text-[15px] font-semibold">{fullName}</h4>
            <div className="text-[12.5px] text-[var(--ink-mute)]">
              {workspaceName}{workspaceName && roleName ? ' · ' : ''}{roleName}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              className="btn btn-outline mt-2 py-1 px-2.5 text-[12px]"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading
                ? <><Loader2 size={12} className="animate-spin" /> Uploading…</>
                : <><Upload size={12} /> Upload photo</>}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input
              className="input"
              value={draft.firstName}
              onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))}
            />
          </Field>
          <Field label="Last name">
            <input
              className="input"
              value={draft.lastName}
              onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))}
            />
          </Field>
          <Field label="Email">
            <input className="input opacity-60 cursor-not-allowed" value={displayEmail} readOnly />
          </Field>
          <Field label="Phone">
            <input
              className="input"
              value={draft.phone}
              placeholder="+92 300 0000000"
              onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
            />
          </Field>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className={`text-[12.5px] flex items-center gap-1.5 ${saved ? 'text-[#15803D]' : 'text-[var(--ink-mute)]'}`}>
            {saved && <><Check size={13} /> Saved successfully</>}
            {!saved && dirty && 'Unsaved changes'}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-outline"
              onClick={() => setDraft(originalDraft)}
              disabled={!dirty || isSaving}
            >Cancel</button>
            <button
              className="btn btn-grad"
              onClick={handleSave}
              disabled={!dirty || isSaving}
            >
              {isSaving
                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                : <><Check size={14} /> Save changes</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────── Notifications Section ────────────────────
function NotifSection() {
  const { notifSettings, updateNotifSettings } = useAppStore();

  const NOTIF_ITEMS: Array<{ k: keyof NotifSettings; title: string; desc: string }> = [
    { k: 'hotLeads',     title: 'Hot lead alerts',      desc: 'Toast + sound when AI flags a hot intent.' },
    { k: 'dailyDigest',  title: 'Daily digest',         desc: 'Morning summary of overnight conversations.' },
    { k: 'weeklyReport', title: 'Weekly performance',   desc: 'Sunday email with funnel + revenue.' },
    { k: 'soundOn',      title: 'Sound on new message', desc: 'Soft chime when a new message lands.' },
    { k: 'push',         title: 'Push notifications',   desc: 'Browser push for urgent actions.' },
  ];

  return (
    <>
      <h2 className="text-[20px] font-semibold">Notifications</h2>
      <div className="card p-[18px]">
        {NOTIF_ITEMS.map((item, i) => (
          <div
            key={item.k}
            className={cn('flex items-center justify-between py-3.5 px-1', i < NOTIF_ITEMS.length - 1 && 'border-b border-[var(--line-soft)]')}
          >
            <div>
              <div className="font-medium text-[13.5px]">{item.title}</div>
              <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">{item.desc}</div>
            </div>
            <CRMSwitch
              on={!!notifSettings[item.k]}
              onChange={v => updateNotifSettings({ [item.k]: v })}
              size="md"
            />
          </div>
        ))}
      </div>
      <div className="text-[11.5px] flex items-center gap-1.5 text-[var(--ink-mute)]">
        <Check size={12} className="text-[#15803D]" /> Preferences save automatically
      </div>
    </>
  );
}

// ──────────────────── Channels Section ────────────────────
function ChannelsSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">Connected Channels</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {CHANNELS_DATA.map(c => (
          <div key={c.ch} className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className={`ch-${c.ch} w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center flex-shrink-0`}>
                <ChannelBadge channel={c.ch} size="xs" iconOnly />
              </span>
              <div className="flex-1">
                <div className="font-medium text-[13.5px]">{c.name}</div>
                <div className="text-[12px] text-[var(--ink-mute)]">{c.acct}</div>
              </div>
              <span className={cn('badge font-medium', c.status === 'connected' ? 'bg-[rgba(34,197,94,0.12)] text-[#15803D]' : 'bg-[rgba(148,163,184,0.16)] text-[var(--ink-soft)]')}>
                {c.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--ink-mute)]">
              <span>{c.date}</span>
              <button className="btn btn-outline py-1 px-2.5 text-[12px]">
                <RefreshCw size={11} /> {c.status === 'connected' ? 'Reconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────── Tier Section ────────────────────
function TierSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">Integration Tier</h2>
      <div className="card p-[22px] border-[var(--accent)] bg-[var(--accent-soft)]">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--accent)] text-white">
            <Crown size={20} />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-semibold">Tier 3 · Storefront API</h3>
              <span className="badge font-medium text-white bg-[var(--accent)]">Current</span>
            </div>
            <div className="text-[13px] mt-1 text-[var(--ink-soft)]">
              Live two-way sync with Shopify + Daraz. AI suggestions enabled. 12,000 messages / month.
            </div>
          </div>
          <button className="btn btn-grad flex-shrink-0"><Zap size={14} /> Upgrade to ERP</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <Metric label="Messages used" v="8,420 / 12K" pct={70} />
          <Metric label="AI credits"    v="4.2K / 10K"  pct={42} />
          <Metric label="Storage"       v="2.1 / 50 GB" pct={4}  />
        </div>
      </div>
    </>
  );
}

// ──────────────────── Access Section ────────────────────
function AccessSection() {
  const { teamUsers } = useAppStore();
  const [role, setRole] = useState('owner');

  const ROLES = [
    { id: 'owner',   name: 'Owner',   desc: 'Full access. Billing, integrations, all data.', count: 1 },
    { id: 'manager', name: 'Manager', desc: 'Manage leads, inventory, replies. No billing.',  count: 3 },
    { id: 'agent',   name: 'Agent',   desc: 'Inbox + assigned leads only.',                   count: 8 },
  ];

  return (
    <>
      <h2 className="text-[20px] font-semibold">Access Control</h2>
      <div className="grid grid-cols-3 gap-3">
        {ROLES.map(r => (
          <div
            key={r.id}
            className={cn(
              'card cursor-pointer flex flex-col gap-2 h-full p-4',
              role === r.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--line)] bg-[var(--surface)]',
            )}
            onClick={() => setRole(r.id)}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[14px] font-medium">{r.name}</h4>
              <span className="badge bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--line)]">
                {r.count}
              </span>
            </div>
            <div className="text-[12.5px] leading-relaxed flex-1 text-[var(--ink-soft)]">{r.desc}</div>
            <button className="btn btn-outline justify-center mt-1">
              <Users size={13} /> Manage members
            </button>
          </div>
        ))}
      </div>
      <div className="card p-[18px]">
        <h4 className="text-[13.5px] font-semibold mb-3">
          Team Members <span className="font-normal text-[12px] text-[var(--ink-mute)]">· manage in Team &amp; Access</span>
        </h4>
        <table className="tbl">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Last active</th></tr>
          </thead>
          <tbody>
            {teamUsers.slice(0, 4).map((u, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <CRMAvatar name={u.name} size={28} />
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="text-[var(--ink-mute)]">{u.email}</td>
                <td>
                  <span className="badge font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
                    {u.role}
                  </span>
                </td>
                <td className="text-[var(--ink-mute)] text-[12px]">{u.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ──────────────────── System Section ────────────────────
const SYSTEM_ICONS = [Sparkles, Activity, Lock, Cloud] as const;

function SystemSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">System Status</h2>
      <div className="card p-[22px] bg-[#0F172A] text-white border border-[rgba(255,255,255,0.08)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-white">All systems operational</h3>
            <div className="text-[12px] mt-1 text-[rgba(255,255,255,0.6)]">Last checked just now</div>
          </div>
          <span className="badge font-medium bg-[rgba(34,197,94,0.2)] text-[#86EFAC]">● Healthy</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {SYSTEM_STATS.map((s, i) => {
            const Icon = SYSTEM_ICONS[i];
            return (
              <div key={i} className="rounded-[10px] p-3.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between">
                  <Icon size={15} className="text-[#C4B5FD]" />
                  <span className={`dot ${s.ok ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                </div>
                <div className="font-semibold mt-2 text-[18px] font-[var(--font-head)]">{s.v}</div>
                <div className="text-[11.5px] text-[rgba(255,255,255,0.65)]">{s.l}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ──────────────────── SettingsView (root) ────────────────────
export function SettingsView() {
  const [section, setSection] = useState<SettingsSection>('profile');

  return (
    <div className="flex gap-3.5 h-full overflow-hidden p-[18px]">
      {/* Sidebar nav */}
      <div className="card flex-shrink-0 flex flex-col gap-1 h-fit p-3.5 w-[220px]">
        <div className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1.5 text-[var(--ink-mute)]">
          Settings
        </div>
        {SECTION_NAV.map(s => {
          const Icon = SECTION_ICONS[s.id];
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] text-left transition-colors cursor-pointer w-full border-none',
                active
                  ? 'bg-[rgba(124,58,237,0.10)] text-[#6D28D9] font-semibold'
                  : 'bg-transparent text-[var(--ink-soft)] font-medium',
              )}
            >
              <Icon size={15} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className={cn(
        'scroll flex-1 overflow-y-auto flex flex-col gap-3.5',
        section === 'workspaces' && 'p-0 gap-0',
      )}>
        {section === 'profile'    && <ProfileSection />}
        {section === 'notif'      && <NotifSection />}
        {section === 'chatbot'    && <ChatbotSection />}
        {section === 'business'   && <BusinessSection />}
        {section === 'channels'   && <ChannelsSection />}
        {section === 'tier'       && <TierSection />}
        {section === 'access'     && <AccessSection />}
        {section === 'workspaces' && <WorkspacesManagementView />}
        {section === 'system'     && <SystemSection />}
      </div>
    </div>
  );
}
