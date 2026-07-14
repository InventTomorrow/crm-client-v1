import { OrderApiView } from '@/features/channels/apiKey/components/OrderApiView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Orders API',
  description: 'Manage API keys, read setup docs, and test the external order API',
};

export default function OrderApiPage() {
  return <div className="h-full overflow-y-auto"><OrderApiView /></div>;
}
