import { OrdersView } from '@/features/orders/components/OrdersView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Create, track, and manage your orders',
};

export default function OrdersPage() {
  return (
    <div className="scroll h-full overflow-y-auto">
      <OrdersView />
    </div>
  );
}
