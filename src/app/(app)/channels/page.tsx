import type { Metadata } from 'next';
import { ChannelsView } from '@/features/channels/components/ChannelsView';

export const metadata: Metadata = {
  title: 'Channels',
  description: 'Connect and manage your messaging channels',
};

export default function ChannelsPage() {
  return <div className="h-full overflow-y-auto"><ChannelsView /></div>;
}
