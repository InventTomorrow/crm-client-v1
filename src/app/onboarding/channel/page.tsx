import type { Metadata } from 'next';
import { ChannelView } from '@/features/onboarding/components/ChannelView';

export const metadata: Metadata = {
  title: 'Connect channel',
  description: 'Connect your messaging channel to get started',
};

export default function OnboardingChannelPage() {
  return <ChannelView />;
}
