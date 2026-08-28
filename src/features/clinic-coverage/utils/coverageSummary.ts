import {
  areaKey,
  type ClinicLocation,
  type ClinicalServiceCoverage,
  type ResolvedCoverageLevel,
} from "../types";

/** How one city/area is covered across the clinic's active services. */
export type AreaCoverageSummary = Record<ResolvedCoverageLevel, number> & {
  total: number;
};

/**
 * Coverage of a single city/area, counted per service.
 *
 * A service with no active row counts as UNKNOWN rather than being dropped —
 * an unanswered service is the case worth surfacing, since the assistant hands
 * those off instead of answering.
 */
export function summarizeAreaCoverage({
  location,
  rows,
  serviceIds,
}: {
  location: Pick<ClinicLocation, "city" | "area">;
  rows: ClinicalServiceCoverage[];
  serviceIds: string[];
}): AreaCoverageSummary {
  const key = areaKey(location.city, location.area);
  const levelByService = new Map<string, ResolvedCoverageLevel>();

  for (const row of rows) {
    if (!row.isActive) continue;
    if (areaKey(row.city, row.area) !== key) continue;
    levelByService.set(row.clinicalServiceId, row.coverage);
  }

  const summary: AreaCoverageSummary = {
    AVAILABLE: 0,
    LIMITED: 0,
    UNAVAILABLE: 0,
    UNKNOWN: 0,
    total: serviceIds.length,
  };

  for (const serviceId of serviceIds) {
    summary[levelByService.get(serviceId) ?? "UNKNOWN"] += 1;
  }
  return summary;
}

export interface CityGroup {
  city: string;
  locations: ClinicLocation[];
}

/** Locations bucketed by city, cities alphabetical, branches in display order. */
export function groupLocationsByCity(locations: ClinicLocation[]): CityGroup[] {
  const byCity = new Map<string, ClinicLocation[]>();

  for (const location of locations) {
    const bucket = byCity.get(location.city);
    if (bucket) bucket.push(location);
    else byCity.set(location.city, [location]);
  }

  return [...byCity.entries()]
    .map(([city, cityLocations]) => ({
      city,
      locations: [...cityLocations].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          (a.branchName ?? a.area ?? "").localeCompare(
            b.branchName ?? b.area ?? "",
          ),
      ),
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}
