import { getClientHealthReport } from "@/features/health/services/healthService";

// A prerendered health response would report the build's state forever.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const report = await getClientHealthReport();

  if (report.status === "down") {
    return Response.json(
      {
        success: false,
        error: {
          code: "common/service_unavailable",
          message: report.message,
          details: report.checks,
        },
      },
      { status: 503, headers: NO_STORE },
    );
  }

  return Response.json({ success: true, data: report }, { headers: NO_STORE });
}
