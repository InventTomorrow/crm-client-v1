import { OrdersWorkspace } from '@/features/orders/components/OrdersWorkspace';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders',
  description:
    'Create, track, and manage your orders, and answer the customization requests waiting on your team',
};

export default function OrdersPage() {
  return (
    <div className="h-full">
      <OrdersWorkspace />
    </div>
  );
}
