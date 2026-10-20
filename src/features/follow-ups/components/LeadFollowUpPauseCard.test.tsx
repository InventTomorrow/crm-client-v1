import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLeadFollowUpStatus, setLeadFollowUpPause } from "../services/followUpsService";
import type { LeadFollowUpStatus } from "../types";
import { LeadFollowUpPauseCard } from "./LeadFollowUpPauseCard";
import { renderWithQueryClient } from "./followUpTestUtils";

vi.mock("../services/followUpsService", () => ({
  getLeadFollowUpStatus: vi.fn(),
  setLeadFollowUpPause: vi.fn(),
}));
vi.mock("@/shared/ui/PermissionGuard", () => ({
  PermissionGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const ACTIVE_STATUS: LeadFollowUpStatus = {
  followUpsPausedAt: null,
  followUpsPausedBy: null,
  isEnabled: true,
  state: "SCHEDULED",
  nextFollowUpAt: "2026-10-22T05:00:00.000Z",
  attemptsSent: 1,
  maxAttempts: 2,
};

const mockedGetStatus = vi.mocked(getLeadFollowUpStatus);
const mockedSetPause = vi.mocked(setLeadFollowUpPause);

async function renderCard(status: LeadFollowUpStatus) {
  mockedGetStatus.mockResolvedValue(status);
  const view = renderWithQueryClient(<LeadFollowUpPauseCard leadId="lead-1" />);
  await waitFor(() => expect(mockedGetStatus).toHaveBeenCalledWith("lead-1"));
  return view;
}

describe("LeadFollowUpPauseCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSetPause.mockResolvedValue({ followUpsPausedAt: null, followUpsPausedBy: null });
  });

  it("renders nothing while follow-ups are off for the workspace", async () => {
    const { container } = await renderCard({ ...ACTIVE_STATUS, isEnabled: false });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the next follow-up and how many were sent", async () => {
    await renderCard(ACTIVE_STATUS);
    expect(await screen.findByText(/^On — a follow-up goes out/)).toBeInTheDocument();
    expect(screen.getByText(/Next follow-up around .*\(1 of 2 sent\)/)).toBeInTheDocument();
  });

  it("says when a follow-up is waiting on a disconnected number", async () => {
    await renderCard({ ...ACTIVE_STATUS, state: "BLOCKED", nextFollowUpAt: null });
    expect(await screen.findByText(/your WhatsApp number is disconnected/)).toBeInTheDocument();
  });

  it("pauses straight away when the agent switches it off", async () => {
    await renderCard(ACTIVE_STATUS);
    await userEvent.click(await screen.findByRole("switch"));
    await waitFor(() => expect(mockedSetPause).toHaveBeenCalledWith("lead-1", true));
  });

  it("asks before undoing the customer's own stop", async () => {
    await renderCard({
      ...ACTIVE_STATUS,
      followUpsPausedAt: "2026-10-20T07:00:00.000Z",
      followUpsPausedBy: "CUSTOMER",
    });
    expect(await screen.findByText(/they asked to stop/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch"));
    expect(mockedSetPause).not.toHaveBeenCalled();
    expect(screen.getByText("Turn follow-ups back on?")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Turn back on" }));
    await waitFor(() => expect(mockedSetPause).toHaveBeenCalledWith("lead-1", false));
  });
});
