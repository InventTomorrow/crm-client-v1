import type { Metadata } from 'next';
import { MenuItemFormView } from '@/features/menu/components/MenuItemFormView';

export const metadata: Metadata = {
  title: 'Edit menu item',
  description: 'Edit a dish on your menu',
};

export default async function EditMenuItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  return (
    <div className="h-full">
      <MenuItemFormView menuItemId={itemId} />
    </div>
  );
}
