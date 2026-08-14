import type { Metadata } from 'next';
import { ProductFormView } from '@/features/inventory/components/ProductFormView';

export const metadata: Metadata = {
  title: 'Add product',
  description: 'Add a new product to your catalog',
};

export default function NewProductPage() {
  return (
    <div className="h-full">
      <ProductFormView />
    </div>
  );
}
