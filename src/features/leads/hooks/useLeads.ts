'use client';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Lead } from '@/lib/mockData';
import type { LeadsFilter } from '../types';
import { extractErrorMessage } from '@/lib/utils';
import {
  fetchLeads,
  fetchLead,
  fetchLeadsPage,
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
  checkDuplicatePhones,
  type UpdateLeadInput,
} from '../services/leadsService';

// Active and archived leads are cached separately so switching between them
// refetches. `LIST_KEY` matches both the plain list (pickers) and the
// paginated list below for cross-list optimistic updates.
const LIST_KEY = ['leads', 'list'] as const;
const listKey = (archived: boolean) => [...LIST_KEY, archived] as const;

const LEADS_PAGE_SIZE = 50;

/** Used only by pick-lists (broadcast recipients, order/new-chat lead select) — a
 *  single bounded page is enough there; the search box covers anything further. */
export function useLeads(archived = false) {
  return useQuery({ queryKey: listKey(archived), queryFn: () => fetchLeads(archived) });
}

/** Paginated leads for the main pipeline table/kanban/list views. */
export function useInfiniteLeads(archived = false) {
  return useInfiniteQuery({
    queryKey: [...listKey(archived), 'infinite'] as const,
    queryFn: ({ pageParam }) => fetchLeadsPage(archived, pageParam, LEADS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === LEADS_PAGE_SIZE ? lastPageParam + 1 : undefined,
  });
}

// Both useLeads (plain array) and useInfiniteLeads (InfiniteData<Lead[]>) share
// the LIST_KEY prefix, so optimistic mutations must update whichever shape a
// given cached query currently holds.
type LeadsCacheData = Lead[] | InfiniteData<Lead[]>;

function updateLeadsCaches(
  queryClient: QueryClient,
  map: (lead: Lead) => Lead,
): void {
  queryClient.setQueriesData<LeadsCacheData>(
    { queryKey: LIST_KEY },
    (old: LeadsCacheData | undefined) => {
      if (!old) return old;
      if (Array.isArray(old)) return old.map(map);
      return { ...old, pages: old.pages.map((page: Lead[]) => page.map(map)) };
    },
  );
}

function removeFromLeadsCaches(queryClient: QueryClient, id: string): void {
  queryClient.setQueriesData<LeadsCacheData>(
    { queryKey: LIST_KEY },
    (old: LeadsCacheData | undefined) => {
      if (!old) return old;
      if (Array.isArray(old)) return old.filter((lead) => lead.id !== id);
      return {
        ...old,
        pages: old.pages.map((page: Lead[]) => page.filter((lead) => lead.id !== id)),
      };
    },
  );
}

/** Single lead by id — used where the list isn't loaded (e.g. the inbox profile). */
export function useLead(id: string | null | undefined) {
  return useQuery({
    queryKey: ['leads', 'detail', id],
    queryFn: () => fetchLead(id!),
    enabled: !!id,
  });
}

// Slow fallback only — the badge is cheap but doesn't need to be second-fresh.
export function useLeadsCount() {
  return useQuery({ queryKey: ['leads', 'count'], queryFn: fetchLeadsCount, refetchInterval: 300_000 });
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
      const previous = queryClient.getQueriesData<LeadsCacheData>({ queryKey: LIST_KEY });
      updateLeadsCaches(queryClient, (lead) => (lead.id === id ? { ...lead, status } : lead));
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
      const previous = queryClient.getQueriesData<LeadsCacheData>({ queryKey: LIST_KEY });
      removeFromLeadsCaches(queryClient, id);
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
    onSuccess: (result) => {
      toast.success(`Imported ${result.successful} lead${result.successful === 1 ? '' : 's'} successfully.`);
      if (result.skipped > 0) {
        toast.warning(`${result.skipped} skipped — a lead with that phone already exists.`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} lead${result.failed === 1 ? '' : 's'} failed to import.`);
      }
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error) || 'Failed to import leads');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

/** Duplicate-phone check against the whole tenant — the paginated cache can't answer this. */
export function useCheckDuplicatePhones() {
  return useMutation({
    mutationFn: checkDuplicatePhones,
    onError: (error) => {
      toast.error(extractErrorMessage(error) || 'Could not check for duplicate phones');
    },
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
