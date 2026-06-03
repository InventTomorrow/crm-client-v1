'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Lead } from '@/lib/mockData';
import type { LeadsFilter } from '../types';
import { extractErrorMessage } from '@/lib/utils';
import {
  fetchLeads,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  exportLeads,
  parseImportCsv,
  bulkCreateLeads,
  type UpdateLeadInput,
} from '../services/leadsService';

export function useLeads() {
  return useQuery({ queryKey: ['leads'], queryFn: fetchLeads });
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
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']) ?? [];
      queryClient.setQueryData(
        ['leads'],
        previousLeads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
      );
      return { previousLeads };
    },
    onError: (error, _variables, rollbackContext) => {
      toast.error(extractErrorMessage(error));
      if (rollbackContext?.previousLeads) {
        queryClient.setQueryData(['leads'], rollbackContext.previousLeads);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']) ?? [];
      queryClient.setQueryData(['leads'], previousLeads.filter((lead) => lead.id !== id));
      return { previousLeads };
    },
    onError: (error, _id, rollbackContext) => {
      toast.error(extractErrorMessage(error));
      if (rollbackContext?.previousLeads) {
        queryClient.setQueryData(['leads'], rollbackContext.previousLeads);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
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

export function filterLeads(leads: Lead[], filter: LeadsFilter): Lead[] {
  return leads.filter((lead) => {
    if (filter.channel !== 'all' && lead.channel !== filter.channel) return false;
    if (filter.search && !lead.name.toLowerCase().includes(filter.search.toLowerCase()))
      return false;
    return true;
  });
}
