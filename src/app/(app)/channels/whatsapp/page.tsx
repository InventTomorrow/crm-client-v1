import { WhatsAppChannelView } from '@/features/channels/whatsapp/components/WhatsAppChannelView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp',
  description: 'Connect WhatsApp and configure the AI assistant',
};

export default function WhatsAppChannelPage() {
  return <div className="h-full overflow-y-auto"><WhatsAppChannelView /></div>;
}
