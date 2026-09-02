/** Image file types a pasted URL is allowed to point at. */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
] as const;

/**
 * Whether a pasted link is one we can show as a product photo.
 *
 * Only http(s) — a `javascript:` or `data:` link parses as a URL too, and this
 * value is stored and rendered later. The extension check is on the path, so a
 * tracking query string (`?v=2`) doesn't disqualify an otherwise valid image.
 */
export function isSupportedImageUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  const path = parsed.pathname.toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.some((extension) =>
    path.endsWith(extension),
  );
}

/** "PNG, JPG, WEBP, GIF, AVIF" — the same list, for a hint line. */
export const SUPPORTED_IMAGE_EXTENSIONS_LABEL = SUPPORTED_IMAGE_EXTENSIONS.map(
  (extension) => extension.replace(".", "").toUpperCase(),
).join(", ");
