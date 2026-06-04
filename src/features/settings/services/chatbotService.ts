import { apiClient } from '@/lib/apiClient';
import type {
  BusinessProfileForm,
  ChatbotConfigForm,
  ChatbotConfigResponse,
} from '../types';

export async function getChatbotConfig(): Promise<ChatbotConfigResponse> {
  const res = await apiClient.get<{ success: true; data: ChatbotConfigResponse }>('/chatbot/config');
  return res.data.data;
}

export async function updateChatbotConfig(data: ChatbotConfigForm): Promise<void> {
  await apiClient.put('/chatbot/config', data);
}

export async function updateBusinessProfile(data: BusinessProfileForm): Promise<void> {
  await apiClient.put('/chatbot/business', data);
}

export async function generateBusinessIntro(businessDescription: string): Promise<string> {
  const res = await apiClient.post<{ success: true; data: { message: string } }>(
    '/chatbot/business/generate',
    { businessDescription },
  );
  return res.data.data.message;
}
