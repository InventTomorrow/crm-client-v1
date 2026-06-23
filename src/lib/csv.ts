import Papa from "papaparse";

/**
 * Parses a CSV string into row objects keyed by lowercased, trimmed headers.
 * Uses PapaParse so quoted cells, embedded commas, newlines and the Excel
 * UTF-8 BOM are handled correctly — no hand-rolled split/regex.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const { data, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
    transform: (v) => v.trim(),
  });

  if (errors.length) {
    throw new Error(errors[0]?.message ?? "Failed to parse CSV file");
  }

  return data;
}

/** Reads a File (CSV) as text and parses it. Strips the Excel UTF-8 BOM. */
export function parseCsvFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      transform: (v) => v.trim(),
      complete: ({ data, errors }) =>
        errors.length
          ? reject(new Error(errors[0]?.message ?? "Failed to parse CSV file"))
          : resolve(data),
      error: (err) => reject(err),
    });
  });
}
