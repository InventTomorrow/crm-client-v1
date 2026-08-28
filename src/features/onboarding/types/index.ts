import { z } from 'zod';
import { BUSINESS_VERTICAL_VALUES, type BusinessVertical } from '@/lib/business-verticals';

export const selectCategorySchema = z.object({
  businessVertical: z.enum(BUSINESS_VERTICAL_VALUES),
});

export const connectChannelSchema = z.object({
  skip: z.boolean().optional(),
  channel: z.enum(['WHATSAPP', 'INSTAGRAM', 'MESSENGER']).optional(),
  accessToken: z.string().optional(),
  wabaId: z.string().optional(),
  phoneNumberId: z.string().optional(),
  pageId: z.string().optional(),
});

export const saveChatbotSchema = z.object({
  greetingMessage: z.string().min(1, 'Greeting message is required'),
  escalationMessage: z.string().min(1, 'Escalation message is required'),
  fallbackMessage: z.string().min(1, 'Fallback message is required'),
  aiPersonality: z.enum(['FORMAL', 'CASUAL', 'PERSUASIVE']),
  aiEnabled: z.boolean(),
});

export type SelectCategoryData = z.infer<typeof selectCategorySchema>;
export type ConnectChannelData = z.infer<typeof connectChannelSchema>;
export type SaveChatbotData = z.infer<typeof saveChatbotSchema>;

export type { BusinessVertical };
export type OnboardingStep = 'CATEGORY' | 'CHANNEL' | 'CHATBOT' | 'DONE';
