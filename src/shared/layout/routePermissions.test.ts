import { describe, expect, it } from "vitest";
import { getRequiredCapability, getRequiredPermission } from "./routePermissions";

describe("getRequiredPermission", () => {
  it("matches a route and its nested paths", () => {
    expect(getRequiredPermission("/leads")).toBe("leads:view");
    expect(getRequiredPermission("/leads/abc123")).toBe("leads:view");
  });

  it("does not match a sibling route sharing the prefix string", () => {
    expect(getRequiredPermission("/leadsfoo")).toBeNull();
  });

  it("longest prefix wins for nested settings routes", () => {
    expect(getRequiredPermission("/settings/billing")).toBe("billing:view");
    expect(getRequiredPermission("/settings/usage")).toBe("billing:view");
    expect(getRequiredPermission("/settings/workspaces")).toBe("settings:edit");
  });

  it("returns null for auth-only routes", () => {
    expect(getRequiredPermission("/settings")).toBeNull();
    expect(getRequiredPermission("/settings/profile")).toBeNull();
  });
});

describe("getRequiredCapability", () => {
  it("maps catalog routes to their vertical capability", () => {
    expect(getRequiredCapability("/inventory")).toBe("CATALOG_PRODUCTS");
    expect(getRequiredCapability("/menu/items")).toBe("CATALOG_MENU");
    expect(getRequiredCapability("/services")).toBe("CATALOG_SERVICES");
  });

  it("gates the Order API page but not the channels root", () => {
    expect(getRequiredCapability("/channels/order-api")).toBe("ORDERS");
    expect(getRequiredCapability("/channels")).toBeNull();
  });

  it("returns null for unrestricted routes", () => {
    expect(getRequiredCapability("/inbox")).toBeNull();
  });
});
