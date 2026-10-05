import { Inbox, Package, ShoppingCart, Users, type LucideIcon } from "lucide-react";

export const FULL_DEMO_VIDEO_ID = "jVZOaJFXTk4";
export const FULL_DEMO_VIDEO_TITLE =
  "AsaanRabta WhatsApp CRM full demo: shared inbox, lead tracking, order booking and inventory sync";

export const CRM_OVERVIEW_VIDEO_ID = "UJLp1V5x-zg";
export const CRM_OVERVIEW_VIDEO_THUMBNAIL = "/demo/thumbnail-crm-summary-video.png";
export const CRM_OVERVIEW_VIDEO_TITLE =
  "AsaanRabta WhatsApp CRM overview: manage leads, orders and customer chats in one dashboard";

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
