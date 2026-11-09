export type MessageBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "bulletList"; items: string[] }
  | { kind: "numberedList"; items: string[] }
  | { kind: "spacer" };

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold" | "italic" | "strike" | "code"; text: string }
  | { kind: "link"; text: string };

const BULLET_LINE = /^\s*[•\-*]\s+(.+)$/;
const NUMBERED_LINE = /^\s*\d+[.)]\s+(.+)$/;

// WhatsApp markers only apply at word edges, so snake_case and 2*3*4 stay literal.
const INLINE_PATTERN =
  /(?<!\w)(?:\*([^*\s](?:[^*\n]*[^*\s])?)\*|_([^_\s](?:[^_\n]*[^_\s])?)_|~([^~\s](?:[^~\n]*[^~\s])?)~|`([^`\n]+)`)(?!\w)|(https?:\/\/[^\s]+)/g;

/** Puts inline "• a • b" bullets (as the assistant often sends them) on their own lines. */
function breakInlineBullets(text: string): string {
  const bulleted = text.replace(/[ \t]+•[ \t]+/g, "\n• ");
  if (bulleted === text) return text;
  // Slot lists end in a time range, so a trailing question after it is the closing prompt.
  return bulleted.replace(/((?:am|pm))[ \t]+([A-Z][^\n•]*\?)\s*$/, "$1\n\n$2");
}

export function parseMessageBlocks(content: string): MessageBlock[] {
  const blocks: MessageBlock[] = [];

  for (const line of breakInlineBullets(content).split("\n")) {
    const lastBlock = blocks[blocks.length - 1];
    const bulletMatch = line.match(BULLET_LINE);
    const numberedMatch = line.match(NUMBERED_LINE);

    if (bulletMatch) {
      if (lastBlock?.kind === "bulletList") lastBlock.items.push(bulletMatch[1]);
      else blocks.push({ kind: "bulletList", items: [bulletMatch[1]] });
    } else if (numberedMatch) {
      if (lastBlock?.kind === "numberedList") lastBlock.items.push(numberedMatch[1]);
      else blocks.push({ kind: "numberedList", items: [numberedMatch[1]] });
    } else if (line.trim() === "") {
      if (lastBlock && lastBlock.kind !== "spacer") blocks.push({ kind: "spacer" });
    } else {
      blocks.push({ kind: "paragraph", text: line.trim() });
    }
  }

  if (blocks[blocks.length - 1]?.kind === "spacer") blocks.pop();
  return blocks;
}

export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) tokens.push({ kind: "text", text: text.slice(cursor, start) });

    const [, bold, italic, strike, code, link] = match;
    if (bold) tokens.push({ kind: "bold", text: bold });
    else if (italic) tokens.push({ kind: "italic", text: italic });
    else if (strike) tokens.push({ kind: "strike", text: strike });
    else if (code) tokens.push({ kind: "code", text: code });
    else tokens.push({ kind: "link", text: link });

    cursor = start + match[0].length;
  }

  if (cursor < text.length) tokens.push({ kind: "text", text: text.slice(cursor) });
  return tokens;
}

/** "Title — a — b" product captions become a bold title with one detail per line. */
export function structureCaption(caption: string): string {
  if (caption.includes("\n") || !caption.includes(" — ")) return caption;
  const [title, ...details] = caption.split(" — ");
  return [`*${title}*`, ...details].join("\n");
}
