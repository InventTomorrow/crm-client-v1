import type { Metadata } from 'next';
import { AnalyticsView } from '@/features/analytics/components/AnalyticsView';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Leads vs orders trends, KPIs, lead funnel and AI handoff analytics',
};

export default function AnalyticsPage() {
  return (
    <div className="h-full">
      <AnalyticsView />
    </div>
  );
}
