import { describe, expect, it } from 'vitest';
import type { ClinicLocation, ClinicalServiceCoverage } from '../types';
import { groupLocationsByCity, summarizeAreaCoverage } from './coverageSummary';

function coverageRow(
  overrides: Partial<ClinicalServiceCoverage> &
    Pick<ClinicalServiceCoverage, 'clinicalServiceId' | 'city' | 'coverage'>,
): ClinicalServiceCoverage {
  return {
    id: `row-${overrides.clinicalServiceId}-${overrides.city}`,
    tenantId: 'tenant-1',
    area: null,
    priceMin: null,
    priceMax: null,
    currency: 'PKR',
    leadTimeNote: null,
    notes: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function clinicLocation(overrides: Partial<ClinicLocation>): ClinicLocation {
  return {
    id: 'loc-1',
    tenantId: 'tenant-1',
    city: 'Lahore',
    area: null,
    branchName: null,
    addressLine: null,
    mapsUrl: null,
    contactPhone: null,
    handlesEmergencies: false,
    isOpen24x7: false,
    emergencyHoursNote: null,
    isActive: true,
    displayOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('summarizeAreaCoverage', () => {
  const serviceIds = ['svc-a', 'svc-b', 'svc-c'];

  it('counts a service with no row as unknown rather than dropping it', () => {
    const summary = summarizeAreaCoverage({
      location: { city: 'Lahore', area: null },
      rows: [
        coverageRow({
          clinicalServiceId: 'svc-a',
          city: 'Lahore',
          coverage: 'AVAILABLE',
        }),
      ],
      serviceIds,
    });

    expect(summary).toEqual({
      AVAILABLE: 1,
      LIMITED: 0,
      UNAVAILABLE: 0,
      UNKNOWN: 2,
      total: 3,
    });
  });

  it('ignores rows for another area and inactive rows', () => {
    const summary = summarizeAreaCoverage({
      location: { city: 'Lahore', area: 'Gulberg' },
      rows: [
        coverageRow({
          clinicalServiceId: 'svc-a',
          city: 'Lahore',
          area: 'Gulberg',
          coverage: 'LIMITED',
        }),
        coverageRow({
          clinicalServiceId: 'svc-b',
          city: 'Lahore',
          area: 'DHA',
          coverage: 'AVAILABLE',
        }),
        coverageRow({
          clinicalServiceId: 'svc-c',
          city: 'Lahore',
          area: 'Gulberg',
          coverage: 'AVAILABLE',
          isActive: false,
        }),
      ],
      serviceIds,
    });

    expect(summary.LIMITED).toBe(1);
    expect(summary.AVAILABLE).toBe(0);
    expect(summary.UNKNOWN).toBe(2);
  });

  it('matches areas case- and whitespace-insensitively', () => {
    const summary = summarizeAreaCoverage({
      location: { city: 'Lahore', area: 'Gulberg' },
      rows: [
        coverageRow({
          clinicalServiceId: 'svc-a',
          city: '  lahore ',
          area: 'GULBERG',
          coverage: 'UNAVAILABLE',
        }),
      ],
      serviceIds: ['svc-a'],
    });

    expect(summary.UNAVAILABLE).toBe(1);
  });
});

describe('groupLocationsByCity', () => {
  it('buckets by city alphabetically and orders branches by displayOrder', () => {
    const groups = groupLocationsByCity([
      clinicLocation({ id: '1', city: 'Lahore', branchName: 'B', displayOrder: 2 }),
      clinicLocation({ id: '2', city: 'Islamabad', branchName: 'C' }),
      clinicLocation({ id: '3', city: 'Lahore', branchName: 'A', displayOrder: 1 }),
    ]);

    expect(groups.map((group) => group.city)).toEqual(['Islamabad', 'Lahore']);
    expect(groups[1].locations.map((location) => location.branchName)).toEqual([
      'A',
      'B',
    ]);
  });
});
