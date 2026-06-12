import type { Metadata } from 'next';
import { AnalyticsView } from '@/features/analytics/components/AnalyticsView';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Lead velocity, channel breakdown, funnel analytics and phase rollout tracking',
};

export default function AnalyticsPage() {
  return (
    <div className="h-full">
      <AnalyticsView />
    </div>
  );
}
