import { leadsApi } from '@/lib/mockApi';
import type { Lead } from '@/lib/mockData';

// When the backend is ready, replace each function body with:
//   return apiClient.post('/leads', lead).then(res => res.data)
// etc. The hook layer stays unchanged.

export const fetchLeads = (): Promise<Lead[]> => leadsApi.getAll();

export const createLead = (lead: Lead): Promise<Lead> => leadsApi.add(lead);

export const updateLeadStatus = (
  id: string,
  status: Lead['status'],
): Promise<{ id: string; status: Lead['status'] }> => leadsApi.updateStatus(id, status);

export const deleteLead = (id: string): Promise<{ id: string }> => leadsApi.delete(id);
