import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientHealthReport } from "./healthService";

const API_ORIGIN = "https://api.example.com";

const serverReport = (status: "ok" | "degraded", message: string) => ({
  success: true,
  data: {
    status,
    message,
    uptimeSeconds: 10,
    timestamp: "2026-10-22T00:00:00.000Z",
    checks: [],
  },
});

const stubFetchResponse = (body: unknown, httpStatus = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () => new Response(JSON.stringify(body), { status: httpStatus }),
    ),
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getClientHealthReport", () => {
  it("reports ok when the backend is healthy", async () => {
    stubFetchResponse(serverReport("ok", "All systems operational"));

    const report = await getClientHealthReport(`${API_ORIGIN}/`);

    expect(report.status).toBe("ok");
    expect(report.message).toBe("All systems operational");
    expect(fetch).toHaveBeenCalledWith(
      `${API_ORIGIN}/health`,
      expect.anything(),
    );
  });

  it("reports down without calling the backend when the API URL is missing", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const report = await getClientHealthReport("");

    expect(report.status).toBe("down");
    expect(report.message).toContain(
      "NEXT_PUBLIC_API_URL is missing or invalid",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("passes the backend's failure message through when it is down", async () => {
    stubFetchResponse(
      {
        success: false,
        error: {
          code: "common/service_unavailable",
          message: "Database is not responding",
        },
      },
      503,
    );

    const report = await getClientHealthReport(API_ORIGIN);

    expect(report.status).toBe("down");
    expect(report.message).toBe("Backend server: Database is not responding");
  });

  it("reports degraded when the backend is degraded", async () => {
    stubFetchResponse(
      serverReport("degraded", "Not configured: Payments (Safepay keys)"),
    );

    const report = await getClientHealthReport(API_ORIGIN);

    expect(report.status).toBe("degraded");
    expect(report.message).toBe(
      "Backend server: Not configured: Payments (Safepay keys)",
    );
  });

  it("reports down when the backend is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );

    const report = await getClientHealthReport(API_ORIGIN);

    expect(report.status).toBe("down");
    expect(report.message).toBe("Backend server is unreachable");
  });

  it("reports down when the backend answers with something other than a health report", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response("<html>Bad Gateway</html>", { status: 502 }),
      ),
    );

    const report = await getClientHealthReport(API_ORIGIN);

    expect(report.status).toBe("down");
    expect(report.message).toBe(
      "Backend server returned an unexpected response (HTTP 502)",
    );
  });
});
