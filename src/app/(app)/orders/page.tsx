import type { Metadata } from 'next';
import { OrdersView } from '@/features/orders/components/OrdersView';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Create, track, and manage your orders',
};

export default function OrdersPage() {
  return (
    <div className="h-full">
      <OrdersView />
    </div>
  );
}
