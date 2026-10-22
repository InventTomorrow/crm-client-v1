"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { seedRecords } from "../services/seedService";
import type { SeedRecordType } from "../types";

const QUERY_KEYS_BY_RECORD_TYPE: Record<SeedRecordType, string[]> = {
  PRODUCT: ["products"],
  MENU_ITEM: ["menu-items", "menu-categories"],
  SERVICE_OFFERING: ["services"],
  CLINICAL_SERVICE: ["clinical-services"],
  PRACTITIONER: ["practitioners"],
};

export function useSeedRecords(recordType: SeedRecordType, label: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (count: number) => seedRecords(recordType, count),
    onSuccess: ({ created }) => {
      QUERY_KEYS_BY_RECORD_TYPE[recordType].forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [queryKey] }),
      );
      toast.success(`${created} ${label.toLowerCase()} added`);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
