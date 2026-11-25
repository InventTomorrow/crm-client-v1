"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useUrlEnumState } from "@/shared/hooks/useUrlEnumState";
import { getAffiliateAnalytics } from "../services/affiliateService";
import { ANALYTICS_RANGE_PRESETS, type AnalyticsRangePreset } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<AnalyticsRangePreset, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

function rangeForPreset(preset: AnalyticsRangePreset) {
  const rangeEnd = new Date();
  rangeEnd.setHours(23, 59, 59, 999);
  const rangeStart = new Date(rangeEnd.getTime() - RANGE_DAYS[preset] * DAY_MS + 1);
  return { from: rangeStart.toISOString(), to: rangeEnd.toISOString() };
}

export function useAffiliateAnalytics(isEnabled: boolean) {
  const [rangePreset, setRangePreset] = useUrlEnumState(
    "range",
    ANALYTICS_RANGE_PRESETS,
    "30d",
  );
  const range = useMemo(() => rangeForPreset(rangePreset), [rangePreset]);

  const analyticsQuery = useQuery({
    queryKey: ["affiliate", "analytics", rangePreset],
    queryFn: () => getAffiliateAnalytics(range),
    enabled: isEnabled,
    placeholderData: keepPreviousData,
  });

  return { analyticsQuery, rangePreset, setRangePreset };
}
