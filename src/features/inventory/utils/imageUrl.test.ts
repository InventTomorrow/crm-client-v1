import { describe, expect, it } from "vitest";
import { isSupportedImageUrl } from "./imageUrl";

describe("isSupportedImageUrl", () => {
  it("accepts http(s) links to a supported image type", () => {
    expect(isSupportedImageUrl("https://cdn.example.com/shirt.jpg")).toBe(true);
    expect(isSupportedImageUrl("http://example.com/a/b/photo.PNG")).toBe(true);
    expect(isSupportedImageUrl("  https://example.com/x.webp  ")).toBe(true);
  });

  it("ignores a query string when checking the extension", () => {
    expect(isSupportedImageUrl("https://example.com/x.png?v=2&w=800")).toBe(
      true,
    );
  });

  it("rejects links with no image extension", () => {
    expect(isSupportedImageUrl("https://example.com/photo")).toBe(false);
    expect(isSupportedImageUrl("https://example.com/page.html")).toBe(false);
  });

  it("rejects anything that is not http(s)", () => {
    expect(isSupportedImageUrl("javascript:alert(1)//x.png")).toBe(false);
    expect(isSupportedImageUrl("data:image/png;base64,AAAA")).toBe(false);
    expect(isSupportedImageUrl("ftp://example.com/x.png")).toBe(false);
  });

  it("rejects text that is not a URL", () => {
    expect(isSupportedImageUrl("")).toBe(false);
    expect(isSupportedImageUrl("shirt.png")).toBe(false);
  });
});
