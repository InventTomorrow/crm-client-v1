import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUpcomingFollowUps } from "../services/followUpsService";
import type { UpcomingFollowUpsView } from "../types";
import { UpcomingFollowUpsCard } from "./UpcomingFollowUpsCard";
import { renderWithQueryClient } from "./followUpTestUtils";

vi.mock("../services/followUpsService", () => ({ getUpcomingFollowUps: vi.fn() }));

const mockedGetUpcoming = vi.mocked(getUpcomingFollowUps);

const UPCOMING: UpcomingFollowUpsView = {
  isAvailable: true,
  followUps: [
    {
      leadId: "lead-1",
      leadName: "Ayesha Khan",
      leadPhone: "03001230001",
      nextAttempt: 1,
      dueAt: "2026-10-31T05:00:00.000Z",
    },
    {
      leadId: "lead-2",
      leadName: null,
      leadPhone: "03001230002",
      nextAttempt: 2,
      dueAt: "2026-11-01T05:00:00.000Z",
    },
  ],
};

describe("UpcomingFollowUpsCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("names each lead with a follow-up scheduled, falling back to the phone", async () => {
    mockedGetUpcoming.mockResolvedValue(UPCOMING);
    renderWithQueryClient(<UpcomingFollowUpsCard />);

    expect(await screen.findByText("Ayesha Khan")).toBeInTheDocument();
    expect(screen.getByText("03001230002")).toBeInTheDocument();
    expect(screen.getByText(/Follow-up 1 ·/)).toBeInTheDocument();
    expect(screen.getByText(/Follow-up 2 ·/)).toBeInTheDocument();
  });

  it("says so when nothing is scheduled", async () => {
    mockedGetUpcoming.mockResolvedValue({ ...UPCOMING, followUps: [] });
    renderWithQueryClient(<UpcomingFollowUpsCard />);
    expect(await screen.findByText("No follow-ups are scheduled.")).toBeInTheDocument();
  });

  it("renders nothing for a vertical without follow-ups", async () => {
    mockedGetUpcoming.mockResolvedValue({ ...UPCOMING, isAvailable: false });
    const { container } = renderWithQueryClient(<UpcomingFollowUpsCard />);
    await waitFor(() => expect(mockedGetUpcoming).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
