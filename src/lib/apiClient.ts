import axios from "axios";

// Hits the backend origin directly rather than the Next.js rewrite proxy —
// the proxy mishandles multiple Set-Cookie headers on one response, silently
// dropping the accessToken cookie set alongside refreshToken on login.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: `${apiOrigin}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isLoggingOut = false;
export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

// Routes that must never trigger an auth redirect (the public landing page).
const PUBLIC_ROUTES = ["/"];
const onPublicRoute = () =>
  typeof window !== "undefined" &&
  PUBLIC_ROUTES.includes(window.location.pathname);

let authOpChain: Promise<unknown> = Promise.resolve();

// Serializes every call that rotates the accessToken/refreshToken cookies
// (refresh, switch-workspace) so they can't race. Without this, a refresh
// triggered by a stale 401 right as the user switches workspace can resolve
// *after* the switch and silently overwrite the new tenant's cookies with
// re-issued old-tenant ones — the switch appears to work, then the next
// request (or a background refetch) is authenticated as the old workspace
// again. Callers queue behind whichever cookie-mutating call is in flight.
export function runExclusiveAuthOp<T>(fn: () => Promise<T>): Promise<T> {
  const result = authOpChain.catch(() => undefined).then(fn);
  authOpChain = result.catch(() => undefined);
  return result;
}

let refreshPromise: Promise<void> | null = null;

// Single-flight /auth/refresh: every caller (the response interceptor's retry
// path below, and the SSE reconnect in useAppEvents) awaits the same in-flight
// request instead of each posting their own. The refresh endpoint rotates and
// revokes the refresh token on use, so two concurrent calls sharing one
// refresh-token cookie would race — the loser looks like token reuse to the
// server and gets its whole token family revoked, killing the session.
export const refreshAccessToken = (): Promise<void> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = runExclusiveAuthOp(() => apiClient.post("/auth/refresh"))
    .then(() => undefined)
    .catch((err) => {
      // Only a real 401 (missing/expired/reused refresh token) means the
      // session is actually dead — redirect there. A 429 (rate limit) or
      // 5xx/network failure (server restart, blip) is transient: redirecting
      // here would log the user out of a still-valid session just because
      // the backend was briefly unreachable. Let the caller's own retry
      // (the SSE reconnect loop, or the response interceptor) try again.
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (
        status === 401 &&
        typeof window !== "undefined" &&
        !isLoggingOut &&
        !onPublicRoute()
      ) {
        window.location.href = "/auth/login";
      }
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if the error is due to an expired access token and is not already a retry
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === "auth/token_expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // If it's a 401 error but NOT a token expiration issue, or if the refresh attempt itself failed
    if (error.response?.status === 401) {
      const url = originalRequest.url ?? "";
      const isAuthRoute =
        url.endsWith("/auth/login") || url.endsWith("/auth/refresh");

      if (!isAuthRoute && !onPublicRoute()) {
        if (typeof window !== "undefined" && !isLoggingOut) {
          window.location.href = "/auth/login";
        }
      }
    }
    //
    return Promise.reject(error);
  },
);
