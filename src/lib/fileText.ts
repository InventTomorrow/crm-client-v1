/** Minimum time (ms) an import overlay stays visible, so a fast parse still reads as real progress. */
export const MIN_IMPORT_OVERLAY_MS = 600;

/** Reads a File as text, resolving no sooner than `minDelayMs` after the read
 * started — keeps import loading animations from flickering on instant parses. */
export function readFileTextWithMinDelay(
  file: File,
  minDelayMs: number = MIN_IMPORT_OVERLAY_MS,
): Promise<string> {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const remaining = minDelayMs - (Date.now() - startedAt);
      if (remaining > 0) setTimeout(() => resolve(text), remaining);
      else resolve(text);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
