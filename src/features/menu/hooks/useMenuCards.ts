'use client';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  createMenuCard,
  deleteMenuCard,
  getMenuCards,
  reorderMenuCards,
  updateMenuCard,
  type CreateMenuCardPayload,
  type UpdateMenuCardPayload,
} from '../services/menuService';
import type { MenuCard } from '../types';

const menuCardKeys = {
  all: ['menu-cards'] as const,
};

/** Snapshots the cache, applies `apply` to it, and returns the rollback context. */
function applyOptimistically(queryClient: QueryClient, apply: (cards: MenuCard[]) => MenuCard[]) {
  const previousCards = queryClient.getQueryData<MenuCard[]>(menuCardKeys.all);
  queryClient.setQueryData<MenuCard[]>(menuCardKeys.all, (cards) => apply(cards ?? []));
  return { previousCards };
}

function rollback(queryClient: QueryClient, context?: { previousCards?: MenuCard[] }) {
  if (context?.previousCards) queryClient.setQueryData(menuCardKeys.all, context.previousCards);
}

export function useMenuCards() {
  return useQuery({
    queryKey: menuCardKeys.all,
    queryFn: getMenuCards,
  });
}

export function useCreateMenuCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMenuCardPayload) => createMenuCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuCardKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to add menu card')),
  });
}

export function useUpdateMenuCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: UpdateMenuCardPayload }) =>
      updateMenuCard(cardId, payload),
    onMutate: async ({ cardId, payload }) => {
      await queryClient.cancelQueries({ queryKey: menuCardKeys.all });
      return applyOptimistically(queryClient, (cards) =>
        cards.map((card) => (card.id === cardId ? { ...card, ...payload } : card)),
      );
    },
    onError: (error, _variables, context) => {
      rollback(queryClient, context);
      toast.error(extractErrorMessage(error, 'Failed to update menu card'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: menuCardKeys.all });
    },
  });
}

export function useReorderMenuCards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardIds: string[]) => reorderMenuCards(cardIds),
    onMutate: async (cardIds) => {
      await queryClient.cancelQueries({ queryKey: menuCardKeys.all });
      return applyOptimistically(queryClient, (cards) =>
        // Reorders in place so the grid settles before the request resolves.
        cardIds
          .map((cardId) => cards.find((card) => card.id === cardId))
          .filter((card): card is MenuCard => !!card)
          .map((card, index) => ({ ...card, sortOrder: index })),
      );
    },
    onError: (error, _variables, context) => {
      rollback(queryClient, context);
      toast.error(extractErrorMessage(error, 'Failed to reorder menu cards'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: menuCardKeys.all });
    },
  });
}

export function useDeleteMenuCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => deleteMenuCard(cardId),
    onMutate: async (cardId) => {
      await queryClient.cancelQueries({ queryKey: menuCardKeys.all });
      return applyOptimistically(queryClient, (cards) =>
        cards.filter((card) => card.id !== cardId),
      );
    },
    onSuccess: () => toast.success('Menu card removed'),
    onError: (error, _variables, context) => {
      rollback(queryClient, context);
      toast.error(extractErrorMessage(error, 'Failed to remove menu card'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: menuCardKeys.all });
    },
  });
}
