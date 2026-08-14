import type { Metadata } from 'next';
import { MenuCategoriesView } from '@/features/menu/components/MenuCategoriesView';

export const metadata: Metadata = {
  title: 'Menu categories',
  description: 'Organise your dishes into the sections customers browse',
};

export default function MenuCategoriesPage() {
  return (
    <div className="h-full">
      <MenuCategoriesView />
    </div>
  );
}
