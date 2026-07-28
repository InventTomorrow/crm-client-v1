import { apiClient } from '@/lib/apiClient';
import type {
  BroadCategory,
  MenuCategory,
  MenuItem,
  MenuItemAddon,
  MenuItemFilters,
  MenuItemVariant,
  MenuTag,
  ServingSize,
} from '../types';

export async function getMenuItems(params: MenuItemFilters & { cursor?: string; limit?: number }) {
  const res = await apiClient.get<{ success: true; data: MenuItem[] }>('/menu', { params });
  return res.data.data;
}

export async function getMenuItem(menuItemId: string) {
  const res = await apiClient.get<{ success: true; data: MenuItem }>(`/menu/${menuItemId}`);
  return res.data.data;
}

export interface CreateMenuItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  calories?: number;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  tagIds?: string[];
  broadCategory?: BroadCategory;
  servingSize?: ServingSize;
}

export type UpdateMenuItemPayload = Partial<CreateMenuItemPayload>;

export async function createMenuItem(payload: CreateMenuItemPayload) {
  const res = await apiClient.post<{ success: true; data: MenuItem }>('/menu', payload);
  return res.data.data;
}

export async function updateMenuItem(menuItemId: string, payload: UpdateMenuItemPayload) {
  const res = await apiClient.put<{ success: true; data: MenuItem }>(`/menu/${menuItemId}`, payload);
  return res.data.data;
}

export async function deleteMenuItem(menuItemId: string) {
  const res = await apiClient.delete(`/menu/${menuItemId}`);
  return res.data;
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getMenuCategories() {
  const res = await apiClient.get<{ success: true; data: MenuCategory[] }>('/menu/categories');
  return res.data.data;
}

export interface CreateMenuCategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export async function createMenuCategory(payload: CreateMenuCategoryPayload) {
  const res = await apiClient.post<{ success: true; data: MenuCategory }>('/menu/categories', payload);
  return res.data.data;
}

export async function deleteMenuCategory(categoryId: string) {
  const res = await apiClient.delete(`/menu/categories/${categoryId}`);
  return res.data;
}

// ─── Tags ───────────────────────────────────────────────────────────────────

export async function getMenuTags() {
  const res = await apiClient.get<{ success: true; data: MenuTag[] }>('/menu/tags');
  return res.data.data;
}

export interface CreateMenuTagPayload {
  name: string;
  color?: string;
  icon?: string;
}

export async function createMenuTag(payload: CreateMenuTagPayload) {
  const res = await apiClient.post<{ success: true; data: MenuTag }>('/menu/tags', payload);
  return res.data.data;
}

export async function deleteMenuTag(tagId: string) {
  const res = await apiClient.delete(`/menu/tags/${tagId}`);
  return res.data;
}
