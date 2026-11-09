import type { ReactNode } from "react";
import {
  parseMessageBlocks,
  tokenizeInline,
  type InlineToken,
} from "../lib/messageFormat";

function renderInline(text: string): ReactNode[] {
  return tokenizeInline(text).map((token, index) => renderToken(token, index));
}

function renderToken(token: InlineToken, key: number): ReactNode {
  switch (token.kind) {
    case "bold":
      return <strong key={key} className="font-semibold">{renderInline(token.text)}</strong>;
    case "italic":
      return <em key={key}>{renderInline(token.text)}</em>;
    case "strike":
      return <s key={key}>{renderInline(token.text)}</s>;
    case "code":
      return <code key={key} className="rounded bg-black/10 px-1 font-mono text-[0.92em]">{token.text}</code>;
    case "link":
      return (
        <a key={key} href={token.text} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
          {token.text}
        </a>
      );
    default:
      return token.text;
  }
}

export function MessageText({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      {parseMessageBlocks(content).map((block, index) => {
        switch (block.kind) {
          case "spacer":
            return <div key={index} className="h-1.5" />;
          case "bulletList":
            return (
              <ul key={index} className="flex flex-col gap-0.5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                    <span className="min-w-0">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "numberedList":
            return (
              <ol key={index} className="flex flex-col gap-0.5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span aria-hidden className="shrink-0 tabular-nums opacity-70">{itemIndex + 1}.</span>
                    <span className="min-w-0">{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return <p key={index}>{renderInline(block.text)}</p>;
        }
      })}
    </div>
  );
}
