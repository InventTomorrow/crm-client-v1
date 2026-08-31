import { describe, expect, it } from 'vitest';
import { filterClinicLocations, filterCoverageGrid } from './filterCoverage';
import type { CoverageArea } from '../types';

const services = [
  { name: 'Home Nursing', category: 'Nursing', shortDescription: 'At-home care' },
  { name: 'Physiotherapy', category: 'Rehab', shortDescription: 'Mobility work' },
];

const areas: CoverageArea[] = [
  { city: 'Islamabad', area: null },
  { city: 'Islamabad', area: 'Bahria' },
  { city: 'Lahore', area: null },
];

describe('filterCoverageGrid', () => {
  it('returns everything for an empty term', () => {
    const result = filterCoverageGrid({ services, areas, searchTerm: '  ' });
    expect(result.services).toHaveLength(2);
    expect(result.areas).toHaveLength(3);
  });

  it('keeps every column when the term only names a service', () => {
    const result = filterCoverageGrid({ services, areas, searchTerm: 'physio' });
    expect(result.services.map((service) => service.name)).toEqual(['Physiotherapy']);
    expect(result.areas).toHaveLength(3);
  });

  it('keeps every row when the term only names a place', () => {
    const result = filterCoverageGrid({ services, areas, searchTerm: 'bahria' });
    expect(result.services).toHaveLength(2);
    expect(result.areas).toEqual([{ city: 'Islamabad', area: 'Bahria' }]);
  });

  it('matches a service by category', () => {
    const result = filterCoverageGrid({ services, areas, searchTerm: 'rehab' });
    expect(result.services.map((service) => service.name)).toEqual(['Physiotherapy']);
  });

  it('returns nothing when the term matches neither axis', () => {
    const result = filterCoverageGrid({ services, areas, searchTerm: 'dentistry' });
    expect(result.services).toEqual([]);
    expect(result.areas).toEqual([]);
  });
});

describe('filterClinicLocations', () => {
  const locations = [
    { city: 'Islamabad', area: 'Bahria', branchName: 'North branch', contactPhone: '0300111' },
    { city: 'Lahore', area: null, addressLine: '12 Mall Road' },
  ];

  it('matches on area', () => {
    expect(filterClinicLocations(locations, 'bahria')).toHaveLength(1);
  });

  it('matches on address line', () => {
    expect(filterClinicLocations(locations, 'mall road')[0]?.city).toBe('Lahore');
  });

  it('matches on phone', () => {
    expect(filterClinicLocations(locations, '0300')).toHaveLength(1);
  });

  it('returns the list untouched for an empty term', () => {
    expect(filterClinicLocations(locations, '')).toHaveLength(2);
  });
});
