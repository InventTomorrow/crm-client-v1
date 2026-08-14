/**
 * A question's field name is a stable storage key, not a label: it is the key inside
 * `LeadQualification.answers` and is referenced by scoring rules and resource targeting
 * conditions. It is never shown or typed — the builder derives it from the question text
 * and keeps it fixed once saved, so answers and rules never lose the key they point at.
 */

/** Matches the `.max()` on both the client and server question schemas. */
export const MAX_FIELD_NAME_LENGTH = 40;

/** Prefix for a key that would otherwise start with a digit — an invalid identifier. */
const NUMERIC_KEY_PREFIX = 'var_';

/**
 * "What's your monthly budget?" → "whatsYourMonthlyBudget".
 * "2026 revenue?" → "var_2026Revenue", because a key may not start with a digit.
 *
 * Non-ASCII input (an Urdu-only question) has no valid characters to build from and
 * yields an empty string — callers fall back to a positional key.
 */
export function toFieldName(questionText: string): string {
  const words = questionText
    // The stored key must satisfy /^[a-zA-Z_][a-zA-Z0-9_]*$/, so anything outside
    // the allowed character set — including runs of whitespace — is a separator.
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  const prefix = /^\d/.test(words[0]!) ? NUMERIC_KEY_PREFIX : '';
  const budget = MAX_FIELD_NAME_LENGTH - prefix.length;

  let fieldName = '';
  for (const [index, word] of words.entries()) {
    const lowercased = word.toLowerCase();
    const segment =
      index === 0 ? lowercased : lowercased[0]!.toUpperCase() + lowercased.slice(1);
    // Stop at the last whole word that fits — a key cut mid-word reads like a typo.
    if (fieldName.length + segment.length > budget) break;
    fieldName += segment;
  }

  // One word longer than the cap leaves nothing behind, so hard-truncate that case.
  return `${prefix}${fieldName || words[0]!.toLowerCase().slice(0, budget)}`;
}

/** The key used when a question's text has no derivable characters. */
export function fallbackFieldName(questionIndex: number): string {
  return `question${questionIndex + 1}`;
}

/**
 * The key a question should store under, guaranteed not to collide with any key
 * already in use. Two questions worded the same derive the same key, and the owner
 * never sees the field to fix it by hand — so the duplicate is numbered here instead.
 */
export function deriveUniqueFieldName(
  questionText: string,
  questionIndex: number,
  takenFieldNames: Iterable<string>,
): string {
  const base = toFieldName(questionText) || fallbackFieldName(questionIndex);
  const taken = new Set(takenFieldNames);
  if (!taken.has(base)) return base;

  for (let suffix = 2; ; suffix += 1) {
    // Trim the base rather than the suffix so the numbered key still fits the cap.
    const room = MAX_FIELD_NAME_LENGTH - String(suffix).length;
    const candidate = `${base.slice(0, room)}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}
