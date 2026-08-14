import type { Metadata } from 'next';
import { MenuItemFormView } from '@/features/menu/components/MenuItemFormView';

export const metadata: Metadata = {
  title: 'Add menu item',
  description: 'Add a new dish to your menu',
};

export default function NewMenuItemPage() {
  return (
    <div className="h-full">
      <MenuItemFormView />
    </div>
  );
}
