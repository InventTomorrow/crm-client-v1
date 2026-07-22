import type { Metadata } from 'next';
import { MenuView } from '@/features/menu/components/MenuView';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Manage the dishes your AI assistant can browse and order',
};

export default function MenuPage() {
  return (
    <div className="h-full">
      <MenuView />
    </div>
  );
}
