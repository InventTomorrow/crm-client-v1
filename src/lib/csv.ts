import Papa from "papaparse";

/**
 * Parses a CSV string into row objects keyed by lowercased, trimmed headers.
 * Uses PapaParse so quoted cells, embedded commas, newlines and the Excel
 * UTF-8 BOM are handled correctly — no hand-rolled split/regex.
 */
/** Row-level column-count mismatches (ragged Excel exports) are recoverable — Papa still fills the row. */
function firstFatalError(
  errors: Papa.ParseError[],
): Papa.ParseError | undefined {
  return errors.find((e) => e.type !== "FieldMismatch");
}

export function parseCsv(text: string): Record<string, string>[] {
  const { data, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
    transform: (v) => v.trim(),
  });

  const fatal = firstFatalError(errors);
  if (fatal) {
    console.log("fatal error white importing from csv: ", fatal);
    throw new Error(fatal.message ?? "Failed to parse CSV file");
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
      complete: ({ data, errors }) => {
        const fatal = firstFatalError(errors);
        fatal
          ? reject(new Error(fatal.message ?? "Failed to parse CSV file"))
          : resolve(data);
      },
      error: (err) => reject(err),
    });
  });
}
