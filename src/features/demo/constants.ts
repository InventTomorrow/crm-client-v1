import { Inbox, Users, ShoppingCart, Package, type LucideIcon } from "lucide-react";

/**
 * Source for the product walkthrough video. Drop an mp4 into `client/public`
 * (e.g. `/demo.mp4`) or swap in a hosted URL — the player falls back to a
 * placeholder while this is empty.
 */
export const DEMO_VIDEO_SRC = "";

/** localStorage key that triggers the welcome dialog once, right after onboarding. */
export const SHOW_DEMO_FLAG = "asaanrabta_show_demo";

export interface DemoHighlight {
  Icon: LucideIcon;
  title: string;
  body: string;
}

export const DEMO_HIGHLIGHTS: DemoHighlight[] = [
  {
    Icon: Inbox,
    title: "Unified inbox",
    body: "Reply to every WhatsApp conversation from one place, with AI drafting replies for you.",
  },
  {
    Icon: Users,
    title: "Lead tracking",
    body: "Conversations are auto-classified into leads so nothing slips through the cracks.",
  },
  {
    Icon: ShoppingCart,
    title: "Orders",
    body: "Book and manage orders manually or let the assistant capture them from chat.",
  },
  {
    Icon: Package,
    title: "Inventory",
    body: "Keep stock in sync — it adjusts automatically as orders are booked or cancelled.",
  },
];
