"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  SEED_MAX_COUNT,
  seedFormSchema,
  type SeedTarget,
  type SeedFormValues,
} from "../types";
import { useSeedProgress } from "./useSeedProgress";
import { useSeedRecords } from "./useSeedRecords";

const DEFAULT_COUNT = 5;
const DONE_STATE_VISIBLE_MS = 4000;

export function useSeedRecordForm({ recordType, label }: SeedTarget) {
  const form = useForm<SeedFormValues>({
    resolver: zodResolver(seedFormSchema),
    defaultValues: { count: DEFAULT_COUNT },
  });
  const seedMutation = useSeedRecords(recordType, label);
  const progress = useSeedProgress(seedMutation.isPending, seedMutation.isSuccess);

  const { isSuccess, reset } = seedMutation;
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(reset, DONE_STATE_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [isSuccess, reset]);

  const count = useWatch({ control: form.control, name: "count" });
  const setCount = (next: number) =>
    form.setValue("count", Math.min(SEED_MAX_COUNT, Math.max(1, next)), { shouldValidate: true });

  return {
    count,
    setCount,
    progress,
    isSeeding: seedMutation.isPending,
    isDone: seedMutation.isSuccess,
    seededCount: seedMutation.data?.created ?? 0,
    seed: form.handleSubmit(({ count: requestedCount }) => seedMutation.mutate(requestedCount)),
  };
}
