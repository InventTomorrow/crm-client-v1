import { apiClient } from '@/lib/apiClient';
import type { Channel } from '@/lib/mockData';
import type { Lead, LeadStatus } from '../types';

const CHANNEL_TO_FE: Record<string, Channel> = {
  WHATSAPP: 'wa', INSTAGRAM: 'ig', MESSENGER: 'fb',
};

// Helper to map backend leads to frontend format
const mapBackendToFrontend = (data: any): Lead => ({
  id: data.id,
  name: data.name || data.phone || 'Unknown',
  city: data.city || 'Unknown',
  channel: CHANNEL_TO_FE[data.channel] ?? 'wa',
  status: (data.status?.toLowerCase() as LeadStatus) || 'prospect',
  phone: data.phone || undefined,
  email: data.email || undefined,
  conversationId: data.conversations?.[0]?.id ?? undefined,
  // Fields not present in basic backend model, mocked for UI consistency
  lastMsg: 'No message history',
  time: data.lastContactedAt ? new Date(data.lastContactedAt).toLocaleDateString() : 'New',
  unread: 0,
  value: 0,
  intent: 'browse',
  health: 50,
});

export const fetchLeads = async (): Promise<Lead[]> => {
  const response = await apiClient.get('/leads');
  return response.data.data.data.map(mapBackendToFrontend);
};

export const fetchLeadsCount = async (): Promise<number> => {
  const response = await apiClient.get('/leads?limit=1');
  return response.data.data.meta?.total ?? 0;
};

// Frontend channel codes → backend ChannelType enum
const CHANNEL_TO_BACKEND: Record<string, 'WHATSAPP' | 'INSTAGRAM' | 'MESSENGER'> = {
  wa: 'WHATSAPP',
  ig: 'INSTAGRAM',
  fb: 'MESSENGER',
  tk: 'WHATSAPP', // TikTok has no backend channel yet — default to WhatsApp
};

export const createLead = async (lead: Partial<Lead> & { phone?: string; email?: string }): Promise<Lead> => {
  const payload = {
    name: lead.name,
    city: lead.city,
    phone: lead.phone || undefined,
    email: lead.email || undefined,
    channel: CHANNEL_TO_BACKEND[lead.channel ?? 'wa'] ?? 'WHATSAPP',
    status: (lead.status ?? 'prospect').toUpperCase(),
  };
  const response = await apiClient.post('/leads', payload);
  return mapBackendToFrontend(response.data.data);
};

export interface UpdateLeadInput {
  name?: string;
  city?: string;
  phone?: string;
  email?: string;
  channel?: Channel;
  status?: Lead['status'];
}

export const updateLead = async (id: string, data: UpdateLeadInput): Promise<Lead> => {
  const payload: Record<string, unknown> = {
    name: data.name,
    city: data.city,
    phone: data.phone || undefined,
    email: data.email || undefined,
    ...(data.channel ? { channel: CHANNEL_TO_BACKEND[data.channel] ?? 'WHATSAPP' } : {}),
    ...(data.status ? { status: data.status.toUpperCase() } : {}),
  };
  const response = await apiClient.put(`/leads/${id}`, payload);
  return mapBackendToFrontend(response.data.data);
};

export const updateLeadStatus = async (
  id: string,
  status: Lead['status'],
): Promise<{ id: string; status: Lead['status'] }> => {
  await apiClient.patch(`/leads/${id}/status`, { status: status.toUpperCase() });
  return { id, status };
};

export const deleteLead = async (id: string): Promise<{ id: string }> => {
  await apiClient.delete(`/leads/${id}`);
  return { id };
};

export const exportLeads = async (): Promise<void> => {
  const res = await apiClient.get('/leads/export', { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const parseImportCsv = async (csvContent: string): Promise<any[]> => {
  const response = await apiClient.post('/leads/import/parse', { csv: csvContent });
  return response.data.data;
};

export const bulkCreateLeads = async (leads: any[]): Promise<{ total: number; successful: number; failed: number }> => {
  const response = await apiClient.post('/leads/import/commit', { leads });
  return response.data.data;
};

