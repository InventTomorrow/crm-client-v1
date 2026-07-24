'use client';
import { useQuery } from '@tanstack/react-query';
import { getMenuItems } from '../services/menuService';
import type { MenuCategory, MenuItem } from '../types';
import { useMenuCategories } from './useMenuCategories';

const PAGE_SIZE = 100;

/** Fetches every available menu item (paging under the hood) for the read-only preview. */
async function fetchAllAvailableMenuItems(): Promise<MenuItem[]> {
  const items: MenuItem[] = [];
  let cursor: string | undefined;

  for (;;) {
    const page = await getMenuItems({ cursor, limit: PAGE_SIZE, isAvailable: true });
    items.push(...page);
    if (page.length < PAGE_SIZE) break;
    cursor = page[page.length - 1]?.id;
  }

  return items;
}

export interface MenuPreviewGroup {
  category: MenuCategory;
  items: MenuItem[];
}

/** Groups available menu items by category, sorted the same way customers browse them. */
export function useMenuPreview(enabled: boolean, search = '') {
  const categoriesQuery = useMenuCategories();
  const itemsQuery = useQuery({
    queryKey: ['menu-items', 'preview-all'],
    queryFn: fetchAllAvailableMenuItems,
    enabled,
  });

  const term = search.trim().toLowerCase();
  const matchesSearch = (item: MenuItem) =>
    !term || item.name.toLowerCase().includes(term);

  const groups: MenuPreviewGroup[] = (categoriesQuery.data ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      category,
      items: (itemsQuery.data ?? [])
        .filter((item) => item.categoryId === category.id && matchesSearch(item))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((group) => group.items.length > 0);

  return {
    groups,
    isLoading: categoriesQuery.isLoading || itemsQuery.isLoading,
  };
}
