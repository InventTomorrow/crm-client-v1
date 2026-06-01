import type { Metadata } from 'next';
import { ChatbotView } from '@/features/onboarding/components/ChatbotView';

export const metadata: Metadata = {
  title: 'Configure chatbot — SaleFlow CRM',
  description: 'Set up your AI chatbot responses',
};

export default function OnboardingChatbotPage() {
  return <ChatbotView />;
}
