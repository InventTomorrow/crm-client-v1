import type { useRouter } from "next/navigation";

type AppRouter = ReturnType<typeof useRouter>;

export const DASHBOARD_PATH = "/dashboard";
const NAVIGATION_POLL_MS = 50;
const NAVIGATION_TIMEOUT_MS = 4000;

/**
 * Sends a workspace switch to the dashboard and resolves once the route has actually changed,
 * so the switching overlay never lifts onto the previous workspace's page.
 */
export async function navigateToDashboard(router: AppRouter): Promise<void> {
  if (window.location.pathname === DASHBOARD_PATH) return;
  // replace, not push — Back must not reopen a page scoped to the old workspace.
  router.replace(DASHBOARD_PATH);

  const startedAt = Date.now();
  while (
    window.location.pathname !== DASHBOARD_PATH &&
    Date.now() - startedAt < NAVIGATION_TIMEOUT_MS
  ) {
    await new Promise((resolve) => setTimeout(resolve, NAVIGATION_POLL_MS));
  }
}
