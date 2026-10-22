import { z } from "zod";

export const healthCheckSchema = z.object({
  name: z.string(),
  isCritical: z.boolean(),
  status: z.enum(["up", "down"]),
  message: z.string(),
  latencyMs: z.number(),
});

/** Mirrors `HealthReport` on the server. */
export const healthReportSchema = z.object({
  status: z.enum(["ok", "degraded", "down"]),
  message: z.string(),
  uptimeSeconds: z.number(),
  timestamp: z.string(),
  checks: z.array(healthCheckSchema),
});

// The server's GET /health: a report on 200, the shared error shape on 503.
export const serverHealthResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), data: healthReportSchema }),
  z.object({
    success: z.literal(false),
    error: z.object({ code: z.string(), message: z.string() }),
  }),
]);

export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type HealthReport = z.infer<typeof healthReportSchema>;
export type ServerHealthResponse = z.infer<typeof serverHealthResponseSchema>;
