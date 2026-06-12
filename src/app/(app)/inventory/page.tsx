import type { Metadata } from 'next';
import { InventoryView } from '@/features/inventory/components/InventoryView';

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage your product catalog with manual, URL sync, and storefront integrations',
};

export default function InventoryPage() {
  return (
    <div className="h-full">
      <InventoryView />
    </div>
  );
}
