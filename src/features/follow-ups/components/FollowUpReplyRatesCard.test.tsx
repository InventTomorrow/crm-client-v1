import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFollowUpAnalytics } from "../services/followUpsService";
import type { FollowUpAnalyticsView } from "../types";
import { FollowUpReplyRatesCard } from "./FollowUpReplyRatesCard";
import { renderWithQueryClient } from "./followUpTestUtils";

vi.mock("../services/followUpsService", () => ({ getFollowUpAnalytics: vi.fn() }));

const mockedGetAnalytics = vi.mocked(getFollowUpAnalytics);

const ANALYTICS: FollowUpAnalyticsView = {
  isAvailable: true,
  replyWindowHours: 72,
  attempts: [
    { attempt: 1, sent: 40, replied: 12, replyRate: 0.3 },
    { attempt: 2, sent: 20, replied: 3, replyRate: 0.15 },
  ],
  totals: { sent: 60, replied: 15, replyRate: 0.25 },
};

describe("FollowUpReplyRatesCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the reply rate per follow-up and overall for the selected range", async () => {
    mockedGetAnalytics.mockResolvedValue(ANALYTICS);
    renderWithQueryClient(<FollowUpReplyRatesCard range="7d" />);

    expect(await screen.findByText("12 of 40 · 30%")).toBeInTheDocument();
    expect(screen.getByText("3 of 20 · 15%")).toBeInTheDocument();
    expect(screen.getByText("15 of 60 · 25%")).toBeInTheDocument();
    expect(screen.getByText(/within 72 hours/)).toBeInTheDocument();
    expect(mockedGetAnalytics).toHaveBeenCalledWith("7d");
  });

  it("says so when nothing was sent", async () => {
    mockedGetAnalytics.mockResolvedValue({
      ...ANALYTICS,
      attempts: [],
      totals: { sent: 0, replied: 0, replyRate: 0 },
    });
    renderWithQueryClient(<FollowUpReplyRatesCard range="30d" />);
    expect(await screen.findByText("No follow-ups were sent in this period.")).toBeInTheDocument();
  });

  it("renders nothing for a vertical without follow-ups", async () => {
    mockedGetAnalytics.mockResolvedValue({ ...ANALYTICS, isAvailable: false });
    const { container } = renderWithQueryClient(<FollowUpReplyRatesCard range="30d" />);
    await waitFor(() => expect(mockedGetAnalytics).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
