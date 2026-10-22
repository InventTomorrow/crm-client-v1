import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getChatbotConfig, updateBusinessHours } from "../../services/chatbotService";
import type { BusinessHoursPayload, ChatbotConfigResponse } from "../../types";
import { BusinessHoursCard } from "./BusinessHoursCard";

vi.mock("../../services/chatbotService", () => ({
  getChatbotConfig: vi.fn(),
  updateBusinessHours: vi.fn(),
}));

const mockedGetConfig = vi.mocked(getChatbotConfig);
const mockedUpdateHours = vi.mocked(updateBusinessHours);

const configWith = (businessHours: BusinessHoursPayload | null): ChatbotConfigResponse =>
  ({ config: { businessHours }, workspaceName: null }) as unknown as ChatbotConfigResponse;

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;
const SAVED_HOURS = {
  ...Object.fromEntries(WEEK_DAYS.map((day) => [day, { open: "09:00", close: "18:00" }])),
  SAT: null,
  SUN: null,
} as BusinessHoursPayload;

function renderCard(businessHours: BusinessHoursPayload | null) {
  mockedGetConfig.mockResolvedValue(configWith(businessHours));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <BusinessHoursCard />
    </QueryClientProvider>,
  );
}

// The first switch is "Open all the time"; the day switches follow in week order.
const openAllTimeSwitch = async () => (await screen.findAllByRole("switch"))[0]!;

describe("BusinessHoursCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUpdateHours.mockResolvedValue(undefined);
  });

  it("defaults to open all the time with no day rows", async () => {
    renderCard(null);
    expect(await screen.findByText("Open all the time")).toBeInTheDocument();
    expect(screen.queryByText("Monday")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save business hours/ })).toBeDisabled();
  });

  it("shows each day with its own window when hours are saved", async () => {
    renderCard(SAVED_HOURS);
    expect(await screen.findByText("Monday")).toBeInTheDocument();
    expect(screen.getByText("Sunday")).toBeInTheDocument();
    expect(screen.getAllByText("Closed")).toHaveLength(2);
  });

  it("saves custom days, with a closed day as null", async () => {
    renderCard(null);
    await userEvent.click(await openAllTimeSwitch());
    expect(await screen.findByText("Monday")).toBeInTheDocument();

    // Switches 1–7 are Monday to Sunday: close Sunday.
    await userEvent.click(screen.getAllByRole("switch")[7]!);
    await userEvent.click(screen.getByRole("button", { name: /Save business hours/ }));

    await waitFor(() => expect(mockedUpdateHours).toHaveBeenCalled());
    const [{ businessHours }] = mockedUpdateHours.mock.calls[0]!;
    expect(businessHours?.MON).toEqual({ open: "09:00", close: "18:00" });
    expect(businessHours?.SUN).toBeNull();
  });

  it("saves null when switched back to open all the time", async () => {
    renderCard(SAVED_HOURS);
    await screen.findByText("Monday");
    await userEvent.click(screen.getAllByRole("switch")[0]!);
    await userEvent.click(screen.getByRole("button", { name: /Save business hours/ }));

    await waitFor(() => expect(mockedUpdateHours).toHaveBeenCalledWith({ businessHours: null }));
  });

  it("will not save custom hours with every day closed", async () => {
    renderCard(SAVED_HOURS);
    await screen.findByText("Monday");
    for (const daySwitch of screen.getAllByRole("switch").slice(1, 6)) {
      await userEvent.click(daySwitch);
    }
    await userEvent.click(screen.getByRole("button", { name: /Save business hours/ }));

    expect(await screen.findByText(/Pick at least one open day/)).toBeInTheDocument();
    expect(mockedUpdateHours).not.toHaveBeenCalled();
  });
});
