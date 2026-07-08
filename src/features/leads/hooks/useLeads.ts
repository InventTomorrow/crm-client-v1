'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Lead } from '@/lib/mockData';
import type { LeadsFilter } from '../types';
import { extractErrorMessage } from '@/lib/utils';
import {
  fetchLeads,
  fetchLead,
  fetchLeadsCount,
  searchLeads,
  createLead,
  updateLead,
  updateLeadStatus,
  archiveLead,
  restoreLead,
  deleteLead,
  exportLeads,
  parseImportCsv,
  bulkCreateLeads,
  type UpdateLeadInput,
} from '../services/leadsService';

// Active and archived leads are cached separately so switching between them
// refetches. `LIST_KEY` matches both for cross-list optimistic updates.
const LIST_KEY = ['leads', 'list'] as const;
const listKey = (archived: boolean) => [...LIST_KEY, archived] as const;

export function useLeads(archived = false) {
  return useQuery({ queryKey: listKey(archived), queryFn: () => fetchLeads(archived) });
}

/** Single lead by id — used where the list isn't loaded (e.g. the inbox profile). */
export function useLead(id: string | null | undefined) {
  return useQuery({
    queryKey: ['leads', 'detail', id],
    queryFn: () => fetchLead(id!),
    enabled: !!id,
  });
}

export function useLeadsCount() {
  return useQuery({ queryKey: ['leads', 'count'], queryFn: fetchLeadsCount, refetchInterval: 30_000 });
}

export function useAddLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    // No optimistic insert — the form passes a partial shape (no lastMsg/time),
    // which would crash list rendering. Show the dialog loading state instead,
    // then refetch on success.
    onSuccess: () => {
      toast.success('Lead added');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) => updateLead(id, data),
    onSuccess: () => {
      toast.success('Lead updated');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) =>
      updateLeadStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      const previous = queryClient.getQueriesData<Lead[]>({ queryKey: LIST_KEY });
      queryClient.setQueriesData<Lead[]>({ queryKey: LIST_KEY }, (old: Lead[] | undefined) =>
        old?.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
      );
      return { previous };
    },
    onError: (error, _variables, ctx) => {
      toast.error(extractErrorMessage(error));
      ctx?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

// Shared behaviour for archive / restore / delete: drop the lead from whichever
// list is currently rendered, then reconcile with the server on settle.
function useRemoveFromListMutation(
  mutationFn: (id: string) => Promise<{ id: string }>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      const previous = queryClient.getQueriesData<Lead[]>({ queryKey: LIST_KEY });
      queryClient.setQueriesData<Lead[]>({ queryKey: LIST_KEY }, (old: Lead[] | undefined) =>
        old?.filter((lead) => lead.id !== id),
      );
      return { previous };
    },
    onSuccess: () => toast.success(successMessage),
    onError: (error, _id, ctx) => {
      toast.error(extractErrorMessage(error));
      ctx?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useArchiveLead() {
  return useRemoveFromListMutation(archiveLead, 'Lead archived');
}

export function useRestoreLead() {
  return useRemoveFromListMutation(restoreLead, 'Lead restored');
}

export function useDeleteLead() {
  return useRemoveFromListMutation(deleteLead, 'Lead deleted');
}

export function useExportLeads() {
  return useMutation({
    mutationFn: exportLeads,
    onSuccess: () => toast.success('Leads exported'),
    onError: (error) => toast.error(extractErrorMessage(error) || 'Export failed'),
  });
}

export function useParseCsv() {
  return useMutation({
    mutationFn: parseImportCsv,
    onError: (error) => {
      toast.error(extractErrorMessage(error) || 'Failed to parse CSV');
    },
  });
}

export function useBulkCreateLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateLeads,
    onSuccess: (data) => {
      toast.success(`Imported ${data.successful} leads successfully.`);
      if (data.failed > 0) {
        toast.warning(`${data.failed} leads failed to import.`);
      }
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error) || 'Failed to import leads');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useSearchLeads(q: string) {
  return useQuery({
    queryKey: ['leads', 'search', q],
    queryFn: () => searchLeads(q),
    enabled: q.trim().length > 1,
    staleTime: 10_000,
  });
}

export function filterLeads(leads: Lead[], filter: LeadsFilter): Lead[] {
  return leads.filter((lead) => {
    if (filter.channel !== 'all' && lead.channel !== filter.channel) return false;
    if (filter.search && !lead.name.toLowerCase().includes(filter.search.toLowerCase()))
      return false;
    return true;
  });
}
