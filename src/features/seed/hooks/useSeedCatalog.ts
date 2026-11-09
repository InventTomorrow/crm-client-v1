"use client";
import { useAppStore } from "@/lib/appStore";
import { useQuery } from "@tanstack/react-query";
import { fetchSeedCatalog } from "../services/seedService";

export function useSeedCatalog(isEnabled: boolean) {
  const workspaceId = useAppStore((state) => state.currentWorkspaceId);
  return useQuery({
    queryKey: ["seed", "catalog", workspaceId],
    queryFn: fetchSeedCatalog,
    enabled: isEnabled && !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}
