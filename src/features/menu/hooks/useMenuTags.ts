'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { createMenuTag, deleteMenuTag, getMenuTags, type CreateMenuTagPayload } from '../services/menuService';

const menuTagKeys = {
  all: ['menu-tags'] as const,
};

export function useMenuTags() {
  return useQuery({
    queryKey: menuTagKeys.all,
    queryFn: getMenuTags,
  });
}

export function useCreateMenuTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMenuTagPayload) => createMenuTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuTagKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create tag')),
  });
}

export function useDeleteMenuTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => deleteMenuTag(tagId),
    onSuccess: () => {
      toast.success('Tag deleted');
      queryClient.invalidateQueries({ queryKey: menuTagKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete tag')),
  });
}
