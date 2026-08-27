import {
  COVERAGE_LEVELS,
  type CoverageLevel,
  type CoverageRowValues,
} from '../types';

export interface CsvParseError {
  line: number;
  message: string;
}

export interface CsvParseResult {
  rows: CoverageRowValues[];
  errors: CsvParseError[];
}

/** Header names accepted, in the order the template writes them. */
const HEADERS = [
  'service',
  'city',
  'area',
  'coverage',
  'priceMin',
  'priceMax',
  'leadTimeNote',
];

export const COVERAGE_CSV_TEMPLATE = `${HEADERS.join(',')}
Home Nursing,Lahore,DHA,AVAILABLE,1500,2500,usually 24-48 hours
Home Nursing,Lahore,,AVAILABLE,1500,3000,
Home Nursing,Multan,,LIMITED,,,
Physiotherapy,Lahore,DHA,AVAILABLE,2500,3000,`;

/** Minimal RFC-4180 field splitter — handles quoted fields containing commas. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === ',') {
      fields.push(current);
      current = '';
    } else current += char;
  }

  fields.push(current);
  return fields.map((field) => field.trim());
}

const parseNumber = (value: string): number | null => {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Turns a coverage CSV into rows ready for the bulk endpoint.
 *
 * Service names are resolved against the clinic's own catalogue rather than
 * trusted: a typo must become a reported error, never a silently-dropped row or
 * a coverage entry pointing at nothing.
 */
export function parseCoverageCsv(
  text: string,
  services: { id: string; name: string }[],
): CsvParseResult {
  const rows: CoverageRowValues[] = [];
  const errors: CsvParseError[] = [];

  const serviceIdByName = new Map(
    services.map((service) => [service.name.trim().toLowerCase(), service.id]),
  );

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows, errors: [{ line: 0, message: 'The file is empty.' }] };
  }

  // Skip a header row if present, matching on the first column.
  const startIndex =
    splitCsvLine(lines[0]!)[0]?.toLowerCase() === 'service' ? 1 : 0;

  for (let i = startIndex; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const [
      serviceName,
      city,
      area,
      coverage,
      priceMin,
      priceMax,
      leadTimeNote,
    ] = splitCsvLine(lines[i]!);

    if (!serviceName || !city) {
      errors.push({
        line: lineNumber,
        message: 'Both a service and a city are required.',
      });
      continue;
    }

    const clinicalServiceId = serviceIdByName.get(serviceName.toLowerCase());
    if (!clinicalServiceId) {
      errors.push({
        line: lineNumber,
        message: `No service named "${serviceName}".`,
      });
      continue;
    }

    const level = (coverage || 'AVAILABLE').toUpperCase();
    if (!COVERAGE_LEVELS.includes(level as CoverageLevel)) {
      errors.push({
        line: lineNumber,
        message: `"${coverage}" is not a coverage level. Use ${COVERAGE_LEVELS.join(', ')}.`,
      });
      continue;
    }

    const min = parseNumber(priceMin ?? '');
    const max = parseNumber(priceMax ?? '');
    if (min != null && max != null && min > max) {
      errors.push({
        line: lineNumber,
        message: 'Minimum price is above the maximum.',
      });
      continue;
    }

    rows.push({
      clinicalServiceId,
      city,
      area: area || null,
      coverage: level as CoverageLevel,
      priceMin: min,
      priceMax: max,
      currency: 'PKR',
      leadTimeNote: leadTimeNote || null,
      notes: null,
      isActive: true,
    });
  }

  return { rows, errors };
}
