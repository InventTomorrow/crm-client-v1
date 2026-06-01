import type { Metadata } from 'next';
import { DoneView } from '@/features/onboarding/components/DoneView';

export const metadata: Metadata = {
  title: 'Setup complete — SaleFlow CRM',
  description: 'Your workspace is ready',
};

export default function OnboardingDonePage() {
  return <DoneView />;
}
