import type { Metadata } from 'next';
import { OrdersView } from '@/features/orders/components/OrdersView';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Create, track, and manage your orders',
};

export default function OrdersPage() {
  return (
    <div className="p-4 md:p-8">
      <OrdersView />
    </div>
  );
}
