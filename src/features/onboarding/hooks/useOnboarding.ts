'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { extractErrorMessage } from '@/lib/utils';
import type { BusinessVertical, ConnectChannelData, SaveChatbotData, SelectCategoryData } from '../types';

async function getOnboardingStatus() {
  const res = await apiClient.get('/onboarding/status');
  return res.data.data as {
    onboardingStep: 'CATEGORY' | 'CHANNEL' | 'CHATBOT' | 'DONE';
    workspaceName: string;
    businessVertical: BusinessVertical;
    inventoryTier: string | null;
    channels: Array<{ channel: string; status: string }>;
    hasChatbotConfig: boolean;
  };
}

async function selectCategory(data: SelectCategoryData) {
  const res = await apiClient.post('/onboarding/category', data);
  return res.data.data as { onboardingStep: 'CHANNEL'; businessVertical: BusinessVertical };
}

async function connectChannel(data: ConnectChannelData) {
  const res = await apiClient.post('/onboarding/channel', data);
  return res.data;
}

async function saveChatbot(data: SaveChatbotData) {
  const res = await apiClient.post('/onboarding/chatbot', data);
  return res.data;
}

async function skipStep() {
  const res = await apiClient.post('/onboarding/skip');
  return res.data.data as { onboardingStep: 'CHATBOT' | 'DONE' };
}

export function useOnboardingStatus() {
  return useQuery({ queryKey: ['onboarding-status'], queryFn: getOnboardingStatus });
}

export function useSelectCategory() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: SelectCategoryData) => selectCategory(data),
    onSuccess: () => router.push('/onboarding/channel'),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useConnectChannel() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: ConnectChannelData) => connectChannel(data),
    onSuccess: () => router.push('/onboarding/chatbot'),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useSaveChatbot() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveChatbotData) => saveChatbot(data),
    onSuccess: () => {
      // Setup is finished server-side; drop the identity cached before it so the
      // app gate refetches instead of reading the pre-completion step.
      queryClient.removeQueries({ queryKey: ['me'] });
      router.push('/onboarding/done');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useSkipOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: skipStep,
    // Skip advances one step only: from the channel step → chatbot config;
    // from the last step → finish into the app.
    onSuccess: (result) => {
      queryClient.removeQueries({ queryKey: ['me'] });
      if (result.onboardingStep === 'CHATBOT') {
        router.push('/onboarding/chatbot');
      } else {
        router.push('/inbox');
      }
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
