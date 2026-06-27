export const CHAT_BG_PRESETS = [
  { id: "default", label: "Default", value: "" },
  { id: "wa-classic", label: "Classic", value: "#ECE5DD" },
  { id: "wa-dark", label: "Night", value: "#0B141A" },
  { id: "teal", label: "Teal", value: "linear-gradient(160deg,#075E54,#128C7E)" },
  { id: "mint", label: "Mint", value: "linear-gradient(160deg,#d4f1c5,#a8e6b0)" },
  { id: "slate", label: "Slate", value: "#1e293b" },
  { id: "blush", label: "Blush", value: "linear-gradient(160deg,#fce4ec,#f8bbd0)" },
  { id: "ocean", label: "Ocean", value: "linear-gradient(160deg,#e3f2fd,#bbdefb)" },
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
