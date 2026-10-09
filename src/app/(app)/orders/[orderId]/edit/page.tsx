import { OrderFormView } from '@/features/orders/components/OrderFormView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit order',
  description: 'Edit an order’s customer details, address and items',
};

export default async function EditOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return (
    <div className="h-full">
      <OrderFormView orderId={orderId} />
    </div>
  );
}
