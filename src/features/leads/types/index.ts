import type { Lead as BaseLead } from '@/lib/mockData';
export type { Channel, LeadStatus, LeadIntent } from '@/lib/mockData';

// Frontend lead carries a few extra backend fields used for edit + open-chat.
export interface Lead extends BaseLead {
  phone?: string;
  email?: string;
  conversationId?: string;
}

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
  closed:   { label: 'Closed',   color: '#8B5CF6', tint: 'rgba(139,92,246,0.10)' },
};
