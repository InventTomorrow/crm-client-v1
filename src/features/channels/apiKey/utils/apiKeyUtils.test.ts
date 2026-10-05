import { describe, expect, it } from "vitest";
import { DOC_SECTION_IDS, DOC_TABLE_OF_CONTENTS, ORDER_FIELD_ROWS } from "./apiDocs.content";
import { API_WORKSPACE_SECTIONS, isPathActive } from "./apiWorkspaceSections";
import { isValidJson } from "./json";
import { buildSampleOrderPayloadText } from "./sandboxSamples";

describe("isValidJson", () => {
  it.each(['{"a":1}', "[]", '"text"', "42"])("accepts %s", (text) => {
    expect(isValidJson(text)).toBe(true);
  });

  it.each(["", "{", "{a:1}", "undefined"])("rejects %s", (text) => {
    expect(isValidJson(text)).toBe(false);
  });
});

describe("isPathActive", () => {
  it("matches the exact path and nested paths", () => {
    expect(isPathActive("/channels/api/sandbox", "/channels/api/sandbox")).toBe(true);
    expect(isPathActive("/channels/api/sandbox/orders", "/channels/api/sandbox")).toBe(true);
  });

  it("does not match a sibling that only shares a prefix", () => {
    expect(isPathActive("/channels/api/keys-archive", "/channels/api/keys")).toBe(false);
  });

  it("opens the orders sandbox from the Sandbox link", () => {
    const sandboxSection = API_WORKSPACE_SECTIONS.find(({ label }) => label === "Sandbox");

    expect(sandboxSection?.href).toBe("/channels/api/sandbox/orders");
  });
});

describe("docs content", () => {
  it("lists every section id exactly once", () => {
    expect(new Set(DOC_SECTION_IDS).size).toBe(DOC_SECTION_IDS.length);
  });

  it("puts the field reference directly above the error codes", () => {
    const topLevelIds = DOC_TABLE_OF_CONTENTS.map((entry) => entry.id);

    expect(topLevelIds.indexOf("field-reference")).toBe(topLevelIds.indexOf("errors") - 1);
  });

  it("documents confirmationMessage as an optional order field", () => {
    const confirmationRow = ORDER_FIELD_ROWS.find((row) => row.field === "confirmationMessage");

    expect(confirmationRow?.isRequired).toBe(false);
  });
});

describe("buildSampleOrderPayloadText", () => {
  it("builds a valid order payload with a fresh externalOrderId and placeholder contact details", () => {
    const samplePayload = JSON.parse(buildSampleOrderPayloadText());

    expect(samplePayload.externalOrderId).toMatch(/^sandbox-\d+$/);
    expect(samplePayload.customer.email).toMatch(/@example\.com$/);
    expect(samplePayload.confirmationMessage).toEqual(expect.any(String));
  });
});
