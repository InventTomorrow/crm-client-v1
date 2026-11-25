import type { Metadata } from 'next';
import { AffiliateDashboardView } from '@/features/affiliate/components/dashboard/AffiliateDashboardView';

export const metadata: Metadata = {
  title: 'Affiliate dashboard',
  description: 'Your referral codes, referred customers and commission earnings',
};

export default function AffiliatePage() {
  return (
    <div className="h-full">
      <AffiliateDashboardView />
    </div>
  );
}
