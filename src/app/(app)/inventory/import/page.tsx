import { ImportProductsView } from '@/features/inventory/components/ImportProductsView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Import products',
  description: 'Import products from a CSV or JSON file into your catalog',
};

export default function ImportProductsPage() {
  return (
    <div className="h-full">
      <ImportProductsView />
    </div>
  );
}
