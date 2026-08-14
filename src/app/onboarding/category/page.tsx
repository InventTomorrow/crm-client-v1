import type { Metadata } from 'next';
import { CategoryView } from '@/features/onboarding/components/CategoryView';

export const metadata: Metadata = {
  title: 'Business type',
  description: 'Tell us what kind of business you run',
};

export default function OnboardingCategoryPage() {
  return <CategoryView />;
}
