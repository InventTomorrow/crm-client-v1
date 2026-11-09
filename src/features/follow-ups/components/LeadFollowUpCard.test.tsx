import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLeadFollowUpStatus, sendFollowUpNow, setLeadFollowUpPause } from "../services/followUpsService";
import type { LeadFollowUpStatus } from "../types";
import { LeadFollowUpCard } from "./LeadFollowUpCard";
import { renderWithQueryClient } from "./followUpTestUtils";

vi.mock("../services/followUpsService", () => ({
  getLeadFollowUpStatus: vi.fn(),
  setLeadFollowUpPause: vi.fn(),
  sendFollowUpNow: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
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
  manualFollowUp: null,
};

const mockedGetStatus = vi.mocked(getLeadFollowUpStatus);
const mockedSetPause = vi.mocked(setLeadFollowUpPause);
const mockedSendNow = vi.mocked(sendFollowUpNow);

async function renderCard(status: LeadFollowUpStatus) {
  mockedGetStatus.mockResolvedValue(status);
  const view = renderWithQueryClient(<LeadFollowUpCard leadId="lead-1" />);
  await waitFor(() => expect(mockedGetStatus).toHaveBeenCalledWith("lead-1"));
  return view;
}

describe("LeadFollowUpCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSetPause.mockResolvedValue({ followUpsPausedAt: null, followUpsPausedBy: null });
    mockedSendNow.mockResolvedValue(undefined);
  });

  it("renders nothing while follow-ups are off for the workspace", async () => {
    const { container } = await renderCard({ ...ACTIVE_STATUS, isEnabled: false });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the next follow-up and how many were sent", async () => {
    await renderCard(ACTIVE_STATUS);
    expect(await screen.findByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText(/The next follow-up goes out around/)).toBeInTheDocument();
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("says when a follow-up is waiting on a disconnected number", async () => {
    await renderCard({ ...ACTIVE_STATUS, state: "BLOCKED", nextFollowUpAt: null });
    expect(await screen.findByText("On hold")).toBeInTheDocument();
    expect(screen.getByText(/because your WhatsApp number was disconnected/)).toBeInTheDocument();
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
    expect(await screen.findByText(/They asked to stop on/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Follow up now/ })).toBeDisabled();

    await userEvent.click(screen.getByRole("switch"));
    expect(mockedSetPause).not.toHaveBeenCalled();
    expect(screen.getByText("Turn follow-ups back on?")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Turn back on" }));
    await waitFor(() => expect(mockedSetPause).toHaveBeenCalledWith("lead-1", false));
  });

  it("queues the follow-up on one click, with no dialog", async () => {
    await renderCard(ACTIVE_STATUS);
    await userEvent.click(await screen.findByRole("button", { name: /Follow up now/ }));

    await waitFor(() => expect(mockedSendNow).toHaveBeenCalledWith("lead-1"));
    expect(screen.queryByText("Follow up now?")).not.toBeInTheDocument();
  });

  it("shows a spinner on the button until the request has queued it", async () => {
    let finishQueuing: () => void = () => undefined;
    mockedSendNow.mockReturnValue(new Promise<void>((resolve) => (finishQueuing = resolve)));
    await renderCard(ACTIVE_STATUS);
    await userEvent.click(await screen.findByRole("button", { name: /Follow up now/ }));

    expect(await screen.findByRole("button", { name: /Queuing/ })).toBeDisabled();
    finishQueuing();
    await waitFor(() => expect(screen.queryByRole("button", { name: /Queuing/ })).not.toBeInTheDocument());
  });

  it("shows Queued and disables the button while the follow-up waits in the queue", async () => {
    await renderCard({ ...ACTIVE_STATUS, manualFollowUp: { state: "QUEUED", at: "2026-10-22T10:00:00.000Z" } });
    expect(await screen.findByText("Queued")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Queued, sending shortly/ })).toBeDisabled();
  });

  it("shows what was sent, or why nothing was", async () => {
    await renderCard({
      ...ACTIVE_STATUS,
      manualFollowUp: { state: "SENT", at: "2026-10-22T10:00:00.000Z", text: "Hi, still keen?" },
    });
    expect(await screen.findByText(/Sent just now:/)).toBeInTheDocument();
    expect(screen.getByText(/Hi, still keen\?/)).toBeInTheDocument();
  });

  it("shows the reason when the follow-up could not be sent", async () => {
    await renderCard({
      ...ACTIVE_STATUS,
      manualFollowUp: { state: "FAILED", at: "2026-10-22T10:00:00.000Z", message: "They wrote last. Reply to them instead of following up." },
    });
    expect(await screen.findByText(/They wrote last/)).toBeInTheDocument();
  });

  it("can follow up now even while the automatic one is on hold", async () => {
    await renderCard({ ...ACTIVE_STATUS, state: "BLOCKED", nextFollowUpAt: null });
    expect(await screen.findByRole("button", { name: /Follow up now/ })).toBeEnabled();
  });
});
