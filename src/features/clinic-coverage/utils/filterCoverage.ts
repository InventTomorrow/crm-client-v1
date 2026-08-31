import { areaLabel, type CoverageArea } from '../types';

/** Only the fields the search reads, so this stays testable without a full record. */
interface SearchableService {
  name: string;
  category?: string | null;
  shortDescription?: string;
}

interface SearchableLocation {
  city: string;
  area?: string | null;
  branchName?: string | null;
  addressLine?: string | null;
  contactPhone?: string | null;
}

function matches(haystack: string | null | undefined, needle: string): boolean {
  return (haystack ?? '').toLowerCase().includes(needle);
}

/**
 * Narrows the grid to what the search term names.
 *
 * One box searches two axes, so a term that only names a place must not empty
 * the rows — it narrows the columns and keeps every service, and the reverse
 * for a term that only names a service. A term matching neither returns both
 * empty, which is how the caller knows to render the no-results state.
 */
export function filterCoverageGrid<TService extends SearchableService>({
  services,
  areas,
  searchTerm,
}: {
  services: TService[];
  areas: CoverageArea[];
  searchTerm: string;
}): { services: TService[]; areas: CoverageArea[] } {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return { services, areas };

  const matchedServices = services.filter(
    (service) =>
      matches(service.name, term) ||
      matches(service.category, term) ||
      matches(service.shortDescription, term),
  );
  const matchedAreas = areas.filter((area) => matches(areaLabel(area), term));

  const hasServiceHit = matchedServices.length > 0;
  const hasAreaHit = matchedAreas.length > 0;

  if (hasServiceHit && hasAreaHit) {
    return { services: matchedServices, areas: matchedAreas };
  }
  if (hasServiceHit) return { services: matchedServices, areas };
  if (hasAreaHit) return { services, areas: matchedAreas };
  return { services: [], areas: [] };
}

/** Locations list search — city, area, branch, address and phone all count. */
export function filterClinicLocations<TLocation extends SearchableLocation>(
  locations: TLocation[],
  searchTerm: string,
): TLocation[] {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return locations;

  return locations.filter(
    (location) =>
      matches(location.city, term) ||
      matches(location.area, term) ||
      matches(location.branchName, term) ||
      matches(location.addressLine, term) ||
      matches(location.contactPhone, term),
  );
}
