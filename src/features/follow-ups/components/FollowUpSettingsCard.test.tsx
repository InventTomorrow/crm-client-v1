import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFollowUpSettings, updateFollowUpSettings } from "../services/followUpsService";
import type { FollowUpSettingsView } from "../types";
import { FollowUpSettingsCard } from "./FollowUpSettingsCard";
import { renderWithQueryClient, TEST_LEAD_VOCABULARY } from "./followUpTestUtils";

vi.mock("../services/followUpsService", () => ({
  getFollowUpSettings: vi.fn(),
  updateFollowUpSettings: vi.fn(),
}));
vi.mock("@/features/leads/utils/leadVocabulary", () => ({
  useLeadVocabulary: () => TEST_LEAD_VOCABULARY,
}));

const AVAILABLE_VIEW: FollowUpSettingsView = {
  settings: {
    enabled: true,
    intervalHours: 24,
    maxAttempts: 2,
    dailyLimit: 100,
    priority: ["HOT", "WARM", "PROSPECT"],
  },
  isAvailable: true,
  eligibleStatuses: ["PROSPECT", "WARM", "HOT"],
  highRiskDailyLimit: 150,
  effectiveDailyLimit: 100,
  numberAgeDays: 90,
  limitRisk: "NONE",
};

const mockedGetSettings = vi.mocked(getFollowUpSettings);
const mockedUpdateSettings = vi.mocked(updateFollowUpSettings);

async function renderLoadedCard(view: FollowUpSettingsView = AVAILABLE_VIEW) {
  mockedGetSettings.mockResolvedValue(view);
  renderWithQueryClient(<FollowUpSettingsCard />);
  await screen.findByText("Follow-ups");
}

async function replaceNumber(label: string, value: string) {
  const input = screen.getByLabelText(label);
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

describe("FollowUpSettingsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUpdateSettings.mockImplementation(async (settings) => ({ ...AVAILABLE_VIEW, settings }));
  });

  it("renders nothing for a vertical without follow-ups", async () => {
    mockedGetSettings.mockResolvedValue({ ...AVAILABLE_VIEW, isAvailable: false });
    const { container } = renderWithQueryClient(<FollowUpSettingsCard />);
    await waitFor(() => expect(mockedGetSettings).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the saved settings with statuses in priority order", async () => {
    await renderLoadedCard();
    expect(screen.getByLabelText("Wait before following up")).toHaveValue(24);
    expect(screen.getByLabelText("Daily limit for your number")).toHaveValue(100);
    const listedStatuses = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(listedStatuses[0]).toContain("Hot");
    expect(listedStatuses[2]).toContain("Prospect");
  });

  it("warns about ban risk as soon as the limit goes above 150, without blocking the save", async () => {
    await renderLoadedCard();
    expect(screen.queryByText(/raises the risk of WhatsApp banning/)).not.toBeInTheDocument();

    await replaceNumber("Daily limit for your number", "200");
    expect(screen.getByText(/raises the risk of WhatsApp banning/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Save follow-ups/ }));
    await waitFor(() =>
      expect(mockedUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ dailyLimit: 200 })),
    );
  });

  it("rejects an impossible daily limit before it reaches the server", async () => {
    await renderLoadedCard();
    await replaceNumber("Daily limit for your number", "10000");
    await userEvent.click(screen.getByRole("button", { name: /Save follow-ups/ }));

    expect(await screen.findByText("At most 300 a day")).toBeInTheDocument();
    expect(mockedUpdateSettings).not.toHaveBeenCalled();
  });

  it("explains when a new number caps the limit", async () => {
    await renderLoadedCard({ ...AVAILABLE_VIEW, effectiveDailyLimit: 30, numberAgeDays: 3 });
    expect(screen.getByText(/connected 3 days ago, so at most 30 a day/)).toBeInTheDocument();
  });

  it("saves a reordered priority with an excluded status left out", async () => {
    await renderLoadedCard();
    await userEvent.click(screen.getByRole("button", { name: "Move Warm up" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Stop following up Prospect" }));
    await userEvent.click(screen.getByRole("button", { name: /Save follow-ups/ }));

    await waitFor(() =>
      expect(mockedUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ priority: ["WARM", "HOT"] }),
      ),
    );
  });
});
