import { describe, expect, it } from "vitest";
import { notificationHref } from "../lib/meta";
import type { Notification } from "../types";
import { isServiceOrderData } from "./ServiceOrderNotificationRow";

const orderData = {
  serviceOrderId: "o1",
  orderLabel: "SO-48213907",
  leadId: "lead-1",
  conversationId: null,
  customer: { name: "Ali Raza", phone: "923004445555", email: null, businessName: "Zara Threads" },
  lines: [{ serviceName: "Logo Design", planName: "Standard", text: "Logo Design — Standard: PKR 15,000 (one-time)" }],
  priceSummary: "PKR 15,000 one-time",
  briefAnswers: [],
  briefSummary: null,
  notes: null,
};

const notification = (data: Notification["data"]): Notification => ({
  id: "n1",
  userId: "u1",
  type: "SERVICE_ORDER_PLACED",
  title: "New order SO-48213907 — Logo Design",
  data,
  isRead: false,
  createdAt: new Date().toISOString(),
});

describe("service order notifications", () => {
  it("renders the full order only when the payload carries one", () => {
    expect(isServiceOrderData(orderData)).toBe(true);
    expect(isServiceOrderData({ orderLabel: "SO-1" })).toBe(false);
    expect(isServiceOrderData(null)).toBe(false);
  });

  it("opens the customer's chat, since orders have no page of their own yet", () => {
    expect(notificationHref(notification(orderData))).toBe("/inbox?lead=lead-1");
    expect(notificationHref(notification(null))).toBe("/inbox");
  });
});
