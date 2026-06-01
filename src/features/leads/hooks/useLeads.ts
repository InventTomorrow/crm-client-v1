'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Lead } from '@/lib/mockData';
import type { LeadsFilter } from '../types';
import { extractErrorMessage } from '@/lib/utils';
import {
  fetchLeads,
  createLead,
  updateLeadStatus,
  deleteLead,
} from '../services/leadsService';

export function useLeads() {
  return useQuery({ queryKey: ['leads'], queryFn: fetchLeads });
}

export function useAddLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onMutate: async (lead) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']) ?? [];
      queryClient.setQueryData(['leads'], [lead, ...previousLeads]);
      return { previousLeads };
    },
    onError: (error, _lead, rollbackContext) => {
      toast.error(extractErrorMessage(error));
      if (rollbackContext?.previousLeads) {
        queryClient.setQueryData(['leads'], rollbackContext.previousLeads);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
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

export function filterLeads(leads: Lead[], filter: LeadsFilter): Lead[] {
  return leads.filter((lead) => {
    if (filter.channel !== 'all' && lead.channel !== filter.channel) return false;
    if (filter.search && !lead.name.toLowerCase().includes(filter.search.toLowerCase()))
      return false;
    return true;
  });
}
