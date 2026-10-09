import { OrderFormView } from '@/features/orders/components/OrderFormView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New order',
  description: 'Create an order by hand',
};

type NewOrderSearchParams = Promise<{ lead?: string | string[]; conversation?: string | string[] }>;

const getSingleParam = (value: string | string[] | undefined) =>
  typeof value === 'string' && value ? value : undefined;

export default async function NewOrderPage({ searchParams }: { searchParams: NewOrderSearchParams }) {
  const { lead, conversation } = await searchParams;

  return (
    <div className="h-full">
      <OrderFormView
        presetLeadId={getSingleParam(lead)}
        presetConversationId={getSingleParam(conversation)}
      />
    </div>
  );
}
