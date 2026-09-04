// Token-derived gradients/patterns instead of fixed hex, so wallpapers stay
// legible and correctly themed in both light and dark mode.
export const CHAT_BG_PRESETS = [
  { id: "default", label: "Default", value: "" },
  {
    id: "mint",
    label: "Mint",
    value:
      "linear-gradient(160deg, color-mix(in oklch, var(--accent) 12%, transparent) 0%, var(--bg) 70%)",
  },
  {
    id: "teal",
    label: "Teal",
    value:
      "linear-gradient(160deg, color-mix(in oklch, var(--accent-2) 18%, transparent) 0%, var(--bg) 65%)",
  },
  {
    id: "violet",
    label: "Violet",
    value:
      "linear-gradient(160deg, color-mix(in oklch, var(--info) 12%, transparent) 0%, var(--bg) 70%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    value:
      "linear-gradient(160deg, color-mix(in oklch, var(--warning) 14%, transparent) 0%, var(--bg) 70%)",
  },
  {
    id: "soft",
    label: "Soft",
    value:
      "linear-gradient(160deg, color-mix(in oklch, var(--surface-2) 70%, transparent) 0%, var(--bg) 100%)",
  },
  {
    id: "dots",
    label: "Dots",
    value:
      "radial-gradient(color-mix(in oklch, var(--ink-mute) 22%, transparent) 1px, transparent 1px) 0 0 / 16px 16px, var(--bg)",
  },
  {
    id: "weave",
    label: "Weave",
    value:
      "repeating-linear-gradient(45deg, color-mix(in oklch, var(--line) 70%, transparent) 0 1px, transparent 1px 12px), var(--bg)",
  },
];

export const BUILT_IN_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "favorites", label: "Favorites" },
  { id: "escalated", label: "Needs Attention" },
  { id: "archived", label: "Archived" },
];

export const EMOJI_LIST = [
  "😊", "😂", "❤️", "👍", "🙏", "😍", "😭", "🤗", "👋", "🎉",
  "🔥", "💯", "✅", "🙌", "😎", "🤝", "💪", "🚀", "👀", "📦",
  "💬", "📞", "🌟", "⭐", "🎁", "💰", "😁", "🥰", "😅", "🤔",
];

export interface CustomTab {
  id: string;
  label: string;
}
