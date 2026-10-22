import {
  serverHealthResponseSchema,
  type HealthCheck,
  type HealthReport,
} from "../types";

const SERVER_CHECK_TIMEOUT_MS = 5_000;

type CheckOutcome = Pick<HealthCheck, "isCritical" | "status" | "message">;

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

function checkApiUrlConfig(apiOrigin: string): HealthCheck {
  const isConfigured = isValidUrl(apiOrigin);
  return {
    name: "api-config",
    isCritical: true,
    status: isConfigured ? "up" : "down",
    // apiClient falls back to the rewrite proxy, which drops auth cookies — so login breaks.
    message: isConfigured
      ? "API URL is configured"
      : "NEXT_PUBLIC_API_URL is missing or invalid — API calls and login will fail",
    latencyMs: 0,
  };
}

async function readServerHealth(apiOrigin: string): Promise<CheckOutcome> {
  let response: Response;
  try {
    response = await fetch(`${apiOrigin}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(SERVER_CHECK_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return {
      isCritical: true,
      status: "down",
      message: isTimeout
        ? `Backend server did not respond within ${SERVER_CHECK_TIMEOUT_MS / 1000}s`
        : "Backend server is unreachable",
    };
  }

  const parsedResponse = serverHealthResponseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!parsedResponse.success) {
    return {
      isCritical: true,
      status: "down",
      message: `Backend server returned an unexpected response (HTTP ${response.status})`,
    };
  }
  if (!parsedResponse.data.success) {
    return {
      isCritical: true,
      status: "down",
      message: `Backend server: ${parsedResponse.data.error.message}`,
    };
  }
  if (parsedResponse.data.data.status !== "ok") {
    return {
      isCritical: false,
      status: "down",
      message: `Backend server: ${parsedResponse.data.data.message}`,
    };
  }
  return {
    isCritical: true,
    status: "up",
    message: "Backend server is healthy",
  };
}

async function checkServer(apiOrigin: string): Promise<HealthCheck> {
  const startedAt = Date.now();
  const outcome = await readServerHealth(apiOrigin);
  return { name: "server", ...outcome, latencyMs: Date.now() - startedAt };
}

function getReportStatus(checks: HealthCheck[]): HealthReport["status"] {
  const failedChecks = checks.filter((check) => check.status === "down");
  if (failedChecks.some((check) => check.isCritical)) return "down";
  return failedChecks.length > 0 ? "degraded" : "ok";
}

function getReportMessage(checks: HealthCheck[]): string {
  const failureMessages = checks
    .filter((check) => check.status === "down")
    .map((check) => check.message);
  return failureMessages.length === 0
    ? "All systems operational"
    : failureMessages.join("; ");
}

export async function getClientHealthReport(
  apiOrigin: string = process.env.NEXT_PUBLIC_API_URL ?? "",
): Promise<HealthReport> {
  const normalizedOrigin = apiOrigin.replace(/\/$/, "");
  const configCheck = checkApiUrlConfig(normalizedOrigin);
  const checks =
    configCheck.status === "up"
      ? [configCheck, await checkServer(normalizedOrigin)]
      : [configCheck];

  return {
    status: getReportStatus(checks),
    message: getReportMessage(checks),
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks,
  };
}
