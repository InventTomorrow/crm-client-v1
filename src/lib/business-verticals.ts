import { ShoppingBag, UtensilsCrossed, type LucideIcon } from 'lucide-react';

export type BusinessVertical = 'ECOMMERCE' | 'RESTAURANT';

export interface BusinessVerticalOption {
  value: BusinessVertical;
  title: string;
  description: string;
  icon: LucideIcon;
}

// Shared between onboarding's category step and the settings business-section
// editor — one list, one place to add a future vertical.
export const BUSINESS_VERTICALS: BusinessVerticalOption[] = [
  {
    value: 'ECOMMERCE',
    title: 'Online store / retail',
    description: 'You sell products — browsing, stock, pricing, and order tracking.',
    icon: ShoppingBag,
  },
  {
    value: 'RESTAURANT',
    title: 'Restaurant / food service',
    description: 'You take food orders — menu browsing, dishes, and order tracking.',
    icon: UtensilsCrossed,
  },
];
