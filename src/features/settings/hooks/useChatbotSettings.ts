'use client';
import { extractErrorMessage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateBusinessIntro,
  getChatbotConfig,
  updateBusinessHours,
  updateBusinessProfile,
  updateChatbotConfig,
  updatePaymentAccounts,
} from '../services/chatbotService';
import type {
  BusinessHoursPayload,
  BusinessProfileForm,
  ChatbotConfigForm,
  ChatbotConfigResponse,
  PaymentAccountsForm,
} from '../types';

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
      queryClient.invalidateQueries({ queryKey: ['wa-config'] });
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

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { businessHours: BusinessHoursPayload | null }) => updateBusinessHours(payload),
    onSuccess: () => {
      toast.success('Business hours saved');
      queryClient.invalidateQueries({ queryKey: KEY });
      // Follow-ups show these hours on their own settings card.
      queryClient.invalidateQueries({ queryKey: ['follow-ups', 'settings'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to save business hours')),
  });
}

export function useUpdatePaymentAccounts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentAccountsForm) => updatePaymentAccounts(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previousConfig = queryClient.getQueryData<ChatbotConfigResponse>(KEY);
      queryClient.setQueryData<ChatbotConfigResponse>(KEY, (current) =>
        current?.config
          ? {
              ...current,
              config: {
                ...current.config,
                defaultPaymentAccountId: data.defaultPaymentAccountId,
                paymentAccounts: data.paymentAccounts.map((account) => ({
                  ...account,
                  bankName: account.bankName || null,
                  iban: account.iban || null,
                  instructions: account.instructions || null,
                })),
              },
            }
          : current,
      );
      return { previousConfig };
    },
    onSuccess: () => toast.success('Payment details saved'),
    onError: (error, _data, context) => {
      if (context?.previousConfig) queryClient.setQueryData(KEY, context.previousConfig);
      toast.error(extractErrorMessage(error, 'Failed to save payment details'));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useGenerateBusinessIntro() {
  return useMutation({
    mutationFn: (businessDescription: string) => generateBusinessIntro(businessDescription),
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to generate intro')),
  });
}
