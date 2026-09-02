import { apiClient } from "@/lib/apiClient";
import type {
  CustomOptionFormData,
  CustomOptionUsage,
  ProductCustomOption,
} from "../types";

const BASE_URL = "/product-custom-options";

export type UpdateCustomOptionPayload = Partial<
  CustomOptionFormData & { isActive: boolean }
>;

export async function getCustomOptions() {
  const res = await apiClient.get<{ success: true; data: ProductCustomOption[] }>(
    BASE_URL,
  );
  return res.data.data;
}

/** Which products still offer this option — read before offering to delete it. */
export async function getCustomOptionUsage(optionId: string) {
  const res = await apiClient.get<{ success: true; data: CustomOptionUsage[] }>(
    `${BASE_URL}/${optionId}/products`,
  );
  return res.data.data;
}

export async function createCustomOption(payload: CustomOptionFormData) {
  const res = await apiClient.post<{ success: true; data: ProductCustomOption }>(
    BASE_URL,
    payload,
  );
  return res.data.data;
}

export async function updateCustomOption(
  optionId: string,
  payload: UpdateCustomOptionPayload,
) {
  const res = await apiClient.patch<{ success: true; data: ProductCustomOption }>(
    `${BASE_URL}/${optionId}`,
    payload,
  );
  return res.data.data;
}

export async function deleteCustomOption(optionId: string) {
  await apiClient.delete(`${BASE_URL}/${optionId}`);
}
