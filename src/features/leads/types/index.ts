export type { Lead, Channel, LeadStatus, LeadIntent } from '@/lib/mockData';

export type LeadsView = 'kanban' | 'list' | 'table';
export type LeadsChannelFilter = 'all' | 'wa' | 'ig' | 'fb' | 'tk';

export interface LeadsFilter {
  channel: LeadsChannelFilter;
  search: string;
}

export const STATUS_META: Record<string, { label: string; color: string; tint: string }> = {
  prospect: { label: 'Prospect', color: '#94A3B8', tint: 'rgba(148,163,184,0.10)' },
  cold:     { label: 'Cold',     color: '#38BDF8', tint: 'rgba(56,189,248,0.10)' },
  warm:     { label: 'Warm',     color: '#F59E0B', tint: 'rgba(245,158,11,0.10)' },
  hot:      { label: 'Hot',      color: '#EF4444', tint: 'rgba(239,68,68,0.08)' },
};
