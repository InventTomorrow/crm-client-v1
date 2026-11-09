'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { getFollowUpSettings, updateFollowUpSettings } from '../services/followUpsService';
import type { FollowUpSettingsForm, FollowUpSettingsView } from '../types';

export const FOLLOW_UP_SETTINGS_KEY = ['follow-ups', 'settings'] as const;

export function useFollowUpSettings() {
  return useQuery({ queryKey: FOLLOW_UP_SETTINGS_KEY, queryFn: getFollowUpSettings });
}

export function useUpdateFollowUpSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: FollowUpSettingsForm) => updateFollowUpSettings(settings),
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: FOLLOW_UP_SETTINGS_KEY });
      const previousView = queryClient.getQueryData<FollowUpSettingsView>(FOLLOW_UP_SETTINGS_KEY);
      queryClient.setQueryData<FollowUpSettingsView>(FOLLOW_UP_SETTINGS_KEY, (currentView) =>
        currentView ? { ...currentView, settings } : currentView,
      );
      return { previousView };
    },
    onSuccess: (savedView) => {
      queryClient.setQueryData(FOLLOW_UP_SETTINGS_KEY, savedView);
      toast.success('Follow-up settings saved');
    },
    onError: (error, _settings, context) => {
      if (context?.previousView) queryClient.setQueryData(FOLLOW_UP_SETTINGS_KEY, context.previousView);
      toast.error(extractErrorMessage(error, 'Failed to save follow-up settings'));
    },
  });
}
