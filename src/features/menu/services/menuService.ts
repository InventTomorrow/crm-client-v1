import { apiClient } from '@/lib/apiClient';
import type { MenuItem, MenuItemFilters } from '../types';

export async function getMenuItems(params: MenuItemFilters & { cursor?: string; limit?: number }) {
  const res = await apiClient.get<{ success: true; data: MenuItem[] }>('/menu', { params });
  return res.data.data;
}

export async function getMenuItem(menuItemId: string) {
  const res = await apiClient.get<{ success: true; data: MenuItem }>(`/menu/${menuItemId}`);
  return res.data.data;
}

export interface CreateMenuItemPayload {
  name: string;
  category: string;
  description?: string;
  price: number;
  ingredients?: string[];
  allergens?: string[];
  isAvailable?: boolean;
  imageUrl?: string;
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
