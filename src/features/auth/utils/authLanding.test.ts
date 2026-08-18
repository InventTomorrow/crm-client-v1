import { describe, expect, it } from "vitest";
import type { AuthLandingUser } from "./authLanding";
import { hasFinishedOnboarding, resolveAuthLanding } from "./authLanding";

const buildUser = (overrides: Partial<AuthLandingUser> = {}): AuthLandingUser => ({
  tenantId: "tenant-1",
  onboardingStatus: "COMPLETE",
  onboardingStep: "DONE",
  ...overrides,
});

describe("resolveAuthLanding", () => {
  it("sends an unverified account to the verification screen, whatever else it has", () => {
    expect(
      resolveAuthLanding(buildUser({ onboardingStatus: "EMAIL_UNVERIFIED" })),
    ).toBe("/auth/verify-email");
  });

  it("sends an account with no workspace to the first wizard step", () => {
    expect(resolveAuthLanding(buildUser({ tenantId: null }))).toBe("/onboarding/workspace");
    expect(resolveAuthLanding(buildUser({ onboardingStep: "WORKSPACE" }))).toBe(
      "/onboarding/workspace",
    );
  });

  it("resumes an unfinished account on the step it still owes", () => {
    const midSetup = buildUser({ onboardingStatus: "ONBOARDING" });

    expect(resolveAuthLanding({ ...midSetup, onboardingStep: "CATEGORY" })).toBe(
      "/onboarding/category",
    );
    expect(resolveAuthLanding({ ...midSetup, onboardingStep: "CHANNEL" })).toBe(
      "/onboarding/channel",
    );
    expect(resolveAuthLanding({ ...midSetup, onboardingStep: "CHATBOT" })).toBe(
      "/onboarding/chatbot",
    );
  });

  // The regression this rule exists for: the step belongs to the active
  // workspace, so a finished user switching into one that never ran the wizard
  // used to get thrown back into it.
  it("keeps a finished account in the app regardless of the active workspace's step", () => {
    const finished = buildUser({ onboardingStatus: "COMPLETE" });

    expect(resolveAuthLanding({ ...finished, onboardingStep: "CATEGORY" })).toBe("/dashboard");
    expect(resolveAuthLanding({ ...finished, onboardingStep: "CHANNEL" })).toBe("/dashboard");
    expect(resolveAuthLanding({ ...finished, onboardingStep: "CHATBOT" })).toBe("/dashboard");
  });

  // Otherwise the user is routed to a wizard the server refuses to run.
  it("does not strand an unfinished account whose workspace is already finished", () => {
    expect(
      resolveAuthLanding(buildUser({ onboardingStatus: "ONBOARDING", onboardingStep: "DONE" })),
    ).toBe("/dashboard");
    expect(
      resolveAuthLanding(buildUser({ onboardingStatus: "ONBOARDING", onboardingStep: null })),
    ).toBe("/dashboard");
  });

  it("lets a finished account into the app", () => {
    expect(resolveAuthLanding(buildUser())).toBe("/dashboard");
  });
});

describe("hasFinishedOnboarding", () => {
  it("tracks the landing decision", () => {
    expect(hasFinishedOnboarding(buildUser())).toBe(true);
    expect(
      hasFinishedOnboarding(buildUser({ onboardingStatus: "ONBOARDING", onboardingStep: "CHANNEL" })),
    ).toBe(false);
    expect(hasFinishedOnboarding(buildUser({ tenantId: null }))).toBe(false);
  });
});
