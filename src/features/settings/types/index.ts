export type { UserProfile, NotifSettings } from '@/lib/mockData';

export type SettingsSection = 'profile' | 'notif' | 'channels' | 'tier' | 'access' | 'system' | 'workspaces';

export const SECTION_NAV: Array<{ id: SettingsSection; label: string }> = [
  { id: 'profile',    label: 'Profile' },
  { id: 'notif',      label: 'Notifications' },
  { id: 'channels',   label: 'Channels' },
  { id: 'tier',       label: 'Integration Tier' },
  { id: 'access',     label: 'Access Control' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'system',     label: 'System Status' },
];

export const CHANNELS_DATA = [
  { ch: 'wa' as const, name: 'WhatsApp Business', acct: '+92 321 4567890',   status: 'connected',    date: 'Connected May 12, 2026' },
  { ch: 'ig' as const, name: 'Instagram',         acct: '@saleflow.pk',      status: 'connected',    date: 'Connected May 14, 2026' },
  { ch: 'fb' as const, name: 'Facebook Pages',    acct: 'SaleFlow Boutique', status: 'connected',    date: 'Connected Apr 30, 2026' },
  { ch: 'tk' as const, name: 'TikTok Shop',       acct: '—',                 status: 'disconnected', date: 'Not connected' },
] as const;

export const SYSTEM_STATS = [
  { l: 'AI Latency',    v: '142ms',  ok: true },
  { l: 'Uptime (30d)',  v: '99.98%', ok: true },
  { l: 'Encryption',   v: 'AES-256', ok: true },
  { l: 'Sync (Shopify)', v: 'Live',  ok: true },
] as const;
