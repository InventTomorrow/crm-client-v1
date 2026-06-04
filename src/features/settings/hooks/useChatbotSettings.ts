'use client';
import { extractErrorMessage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateBusinessIntro,
  getChatbotConfig,
  updateBusinessProfile,
  updateChatbotConfig,
} from '../services/chatbotService';
import type { BusinessProfileForm, ChatbotConfigForm } from '../types';

const KEY = ['chatbot-config'];

export function useChatbotConfig() {
  return useQuery({ queryKey: KEY, queryFn: getChatbotConfig });
}

export function useUpdateChatbotConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChatbotConfigForm) => updateChatbotConfig(data),
    onSuccess: () => {
      toast.success('Chatbot settings saved');
      queryClient.invalidateQueries({ queryKey: KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to save settings')),
  });
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessProfileForm) => updateBusinessProfile(data),
    onSuccess: () => {
      toast.success('Business profile saved');
      queryClient.invalidateQueries({ queryKey: KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to save business profile')),
  });
}

export function useGenerateBusinessIntro() {
  return useMutation({
    mutationFn: (businessDescription: string) => generateBusinessIntro(businessDescription),
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to generate intro')),
  });
}
