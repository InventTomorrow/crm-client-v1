import { ProductFormView } from '@/features/inventory/components/ProductFormView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit product',
  description: 'Edit a product in your catalog',
};

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;

  return (
    <div className="h-full">
      <ProductFormView productId={productId} />
    </div>
  );
}
