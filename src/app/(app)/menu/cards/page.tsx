import type { Metadata } from 'next';
import { MenuCardsView } from '@/features/menu/components/MenuCardsView';

export const metadata: Metadata = {
  title: 'Menu cards',
  description: 'Photos of your physical menu, sent to customers who ask to see it',
};

export default function MenuCardsPage() {
  return (
    <div className="h-full">
      <MenuCardsView />
    </div>
  );
}
