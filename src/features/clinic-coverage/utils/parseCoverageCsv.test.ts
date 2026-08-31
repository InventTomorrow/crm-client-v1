import { describe, expect, it } from 'vitest';
import { COVERAGE_CSV_TEMPLATE, parseCoverageCsv } from './parseCoverageCsv';

const services = [
  { id: 's1', name: 'Home Nursing' },
  { id: 's2', name: 'Physiotherapy' },
];

describe('parseCoverageCsv', () => {
  it('parses the bundled template without errors', () => {
    const result = parseCoverageCsv(COVERAGE_CSV_TEMPLATE, services);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(4);
  });

  it('resolves service names to ids, case-insensitively', () => {
    const result = parseCoverageCsv(
      'service,city\nhome nursing,Lahore',
      services,
    );
    expect(result.rows[0]?.clinicalServiceId).toBe('s1');
  });

  it('reports an unknown service instead of silently dropping the row', () => {
    // A typo must surface, never become a row pointing at nothing.
    const result = parseCoverageCsv(
      'service,city\nHome Nursng,Lahore',
      services,
    );
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0]?.message).toContain('No service named');
  });

  it('treats a blank area as a whole-city row', () => {
    const result = parseCoverageCsv(
      'service,city,area\nHome Nursing,Lahore,',
      services,
    );
    expect(result.rows[0]?.area).toBeNull();
  });

  it('keeps an area when one is given', () => {
    const result = parseCoverageCsv(
      'service,city,area\nHome Nursing,Lahore,DHA',
      services,
    );
    expect(result.rows[0]?.area).toBe('DHA');
  });

  it('defaults coverage to AVAILABLE when the column is blank', () => {
    const result = parseCoverageCsv(
      'service,city,area,coverage\nHome Nursing,Lahore,,',
      services,
    );
    expect(result.rows[0]?.coverage).toBe('AVAILABLE');
  });

  it('rejects a coverage value that is not a real level', () => {
    const result = parseCoverageCsv(
      'service,city,area,coverage\nHome Nursing,Lahore,,MAYBE',
      services,
    );
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0]?.message).toContain('not a coverage level');
  });

  it('rejects a band whose minimum is above its maximum', () => {
    const result = parseCoverageCsv(
      'service,city,area,coverage,priceMin,priceMax\nHome Nursing,Lahore,,AVAILABLE,5000,1000',
      services,
    );
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0]?.message).toContain('above the maximum');
  });

  it('requires both a service and a city', () => {
    const result = parseCoverageCsv(
      'service,city\n,Lahore\nHome Nursing,',
      services,
    );
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(2);
  });

  it('handles a quoted field containing a comma', () => {
    const result = parseCoverageCsv(
      'service,city,area,coverage,priceMin,priceMax,leadTimeNote\nHome Nursing,Lahore,,AVAILABLE,,,"24 hours, sometimes 48"',
      services,
    );
    expect(result.rows[0]?.leadTimeNote).toBe('24 hours, sometimes 48');
  });

  it('works without a header row', () => {
    const result = parseCoverageCsv(
      'Home Nursing,Lahore,DHA,LIMITED',
      services,
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.coverage).toBe('LIMITED');
  });

  it('keeps good rows and reports only the bad ones', () => {
    const result = parseCoverageCsv(
      'service,city\nHome Nursing,Lahore\nGhost Service,Lahore\nPhysiotherapy,Karachi',
      services,
    );
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.line).toBe(3);
  });

  it('reports an empty file rather than returning nothing quietly', () => {
    expect(parseCoverageCsv('   ', services).errors[0]?.message).toContain(
      'empty',
    );
  });
});
