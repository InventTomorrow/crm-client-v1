import { apiClient } from "@/lib/apiClient";
import type {
  SeedCatalogEntry,
  SeedRecordsResult,
  SeedRecordType,
} from "../types";

export async function fetchSeedCatalog(): Promise<SeedCatalogEntry[]> {
  const response = await apiClient.get<{ data: SeedCatalogEntry[] }>(
    "/seed/catalog",
  );
  return response.data.data;
}

export async function seedRecords(
  recordType: SeedRecordType,
  count: number,
): Promise<SeedRecordsResult> {
  const response = await apiClient.post<{ data: SeedRecordsResult }>(
    `/seed/${recordType}`,
    { count },
  );
  return response.data.data;
}
