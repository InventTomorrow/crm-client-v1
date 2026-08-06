/**
 * A question's field name is a stable storage key, not a label: it is the key inside
 * `LeadQualification.answers` and is referenced by scoring rules and resource targeting
 * conditions. Deriving it keeps keys consistent (`monthlyBudget`, never `monthly_budget`
 * beside `monthlyBudget`), but only ever for a key that has not been saved yet.
 */

/** Matches the `.max()` on both the client and server question schemas. */
export const MAX_FIELD_NAME_LENGTH = 40;

/**
 * "What's your monthly budget?" → "whatsYourMonthlyBudget".
 *
 * Non-ASCII input (an Urdu-only question) has no valid characters to build from and
 * yields an empty string — callers fall back to a positional key.
 */
export function toFieldName(questionText: string): string {
  const words = questionText
    // The stored key must satisfy /^[a-zA-Z0-9_]+$/, so anything outside that is a separator.
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  let fieldName = '';
  for (const [index, word] of words.entries()) {
    const lowercased = word.toLowerCase();
    const segment =
      index === 0 ? lowercased : lowercased[0]!.toUpperCase() + lowercased.slice(1);
    // Stop at the last whole word that fits — a key cut mid-word reads like a typo.
    if (fieldName.length + segment.length > MAX_FIELD_NAME_LENGTH) break;
    fieldName += segment;
  }

  // One word longer than the cap leaves nothing behind, so hard-truncate that case.
  return fieldName || words[0]!.toLowerCase().slice(0, MAX_FIELD_NAME_LENGTH);
}

/** The key used when a question's text has no derivable characters. */
export function fallbackFieldName(questionIndex: number): string {
  return `question${questionIndex + 1}`;
}
