import { beforeEach, describe, expect, it } from "vitest";
import type { Notification } from "./mockData";
import { useAppStore } from "./appStore";

const initialState = useAppStore.getState();

const notification = (id: string, read = false): Notification =>
  ({ id, read }) as Notification;

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
    localStorage.clear();
  });

  it("toggles the sidebar and theme", () => {
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);

    expect(useAppStore.getState().theme).toBe("light");
    useAppStore.getState().toggleTheme();
    expect(useAppStore.getState().theme).toBe("dark");
    useAppStore.getState().toggleTheme();
    expect(useAppStore.getState().theme).toBe("light");
  });

  it("marks a single notification read without touching the others", () => {
    useAppStore.setState({ notifications: [notification("a"), notification("b")] });

    useAppStore.getState().markNotificationRead("a");

    const [a, b] = useAppStore.getState().notifications;
    expect(a?.read).toBe(true);
    expect(b?.read).toBe(false);
  });

  it("marks every notification read", () => {
    useAppStore.setState({ notifications: [notification("a"), notification("b")] });
    useAppStore.getState().markAllRead();
    expect(useAppStore.getState().notifications.every((n) => n.read)).toBe(true);
  });

  it("clears the workspace name when switching ends", () => {
    useAppStore.getState().setWorkspaceSwitching(true, "My Shop");
    expect(useAppStore.getState().switchingToWorkspaceName).toBe("My Shop");

    useAppStore.getState().setWorkspaceSwitching(false, "Ignored");
    expect(useAppStore.getState().isSwitchingWorkspace).toBe(false);
    expect(useAppStore.getState().switchingToWorkspaceName).toBeNull();
  });

  it("shallow-merges profile updates", () => {
    useAppStore.getState().updateProfile({ name: "Ali", city: "Lahore" });
    useAppStore.getState().updateProfile({ city: "Karachi" });

    const profile = useAppStore.getState().profile;
    expect(profile.name).toBe("Ali");
    expect(profile.city).toBe("Karachi");
  });
});
