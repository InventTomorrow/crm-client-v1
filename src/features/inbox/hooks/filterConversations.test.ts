import { describe, expect, it } from "vitest";
import type { ConversationListItem } from "../types";
import { filterConversations } from "./useConversations";

const conversation = (
  id: string,
  overrides: Partial<ConversationListItem> = {},
): ConversationListItem =>
  ({
    id,
    channel: "WHATSAPP",
    escalationStatus: "NONE",
    aiEnabled: true,
    lastMessageAt: "2026-08-11T10:00:00.000Z",
    unreadCount: 0,
    createdAt: "2026-08-11T09:00:00.000Z",
    lead: { id: `lead-${id}`, name: id },
    ...overrides,
  }) as ConversationListItem;

const chats = [
  conversation("plain"),
  conversation("escalated", { escalationStatus: "ESCALATED" as never }),
  conversation("unread", { unreadCount: 3 }),
  conversation("favorite"),
  conversation("archived-one"),
  conversation("hidden-one"),
];

const favorites = new Set(["favorite"]);
const archived = new Set(["archived-one"]);
const hidden = new Set(["hidden-one"]);

describe("filterConversations", () => {
  it("hides locally deleted chats from every view", () => {
    for (const filter of ["all", "unread", "archived", "favorites"] as const) {
      const ids = filterConversations(chats, filter, favorites, {}, archived, hidden).map((c) => c.id);
      expect(ids).not.toContain("hidden-one");
    }
  });

  it("shows only archived chats on the archived tab and excludes them elsewhere", () => {
    const archivedIds = filterConversations(chats, "archived", favorites, {}, archived, hidden).map((c) => c.id);
    expect(archivedIds).toEqual(["archived-one"]);

    const allIds = filterConversations(chats, "all", favorites, {}, archived, hidden).map((c) => c.id);
    expect(allIds).not.toContain("archived-one");
  });

  it("filters escalated, unread, and favorites", () => {
    expect(filterConversations(chats, "escalated", favorites, {}, archived, hidden).map((c) => c.id)).toEqual(["escalated"]);
    expect(filterConversations(chats, "unread", favorites, {}, archived, hidden).map((c) => c.id)).toEqual(["unread"]);
    expect(filterConversations(chats, "favorites", favorites, {}, archived, hidden).map((c) => c.id)).toEqual(["favorite"]);
  });

  it("treats an unknown filter with tab assignments as a custom tab", () => {
    const ids = filterConversations(chats, "vip", favorites, { vip: ["plain", "unread"] }, archived, hidden).map((c) => c.id);
    expect(ids).toEqual(["plain", "unread"]);
  });

  it("falls back to all active chats for an unknown filter without assignments", () => {
    const ids = filterConversations(chats, "nonexistent", favorites, {}, archived, hidden).map((c) => c.id);
    expect(ids).toEqual(["plain", "escalated", "unread", "favorite"]);
  });
});
