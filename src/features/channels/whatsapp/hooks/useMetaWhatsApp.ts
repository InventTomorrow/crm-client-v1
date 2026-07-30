"use client";
import { extractErrorMessage } from "@/lib/utils";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  connectMetaManual,
  disconnectMetaWA,
  exchangeMetaOAuthCode,
  getMetaSignupConfig,
  getMetaWAState,
} from "../services/metaWhatsapp.service";
import type {
  MetaManualConnectPayload,
  MetaOAuthExchangePayload,
  MetaWAState,
} from "../types";

// ── Facebook JS SDK loader ───────────────────────────────────────────────────

declare global {
  interface Window {
    FB?: {
      init: (opts: Record<string, unknown>) => void;
      login: (
        cb: (resp: FBLoginResponse) => void,
        opts: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FBLoginResponse {
  authResponse?: { code?: string } | null;
  status?: string;
}

function loadFacebookSdk(appId: string, version: string): Promise<void> {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }
    window.fbAsyncInit = () => {
      window.FB!.init({ appId, autoLogAppEvents: true, xfbml: false, version });
      resolve();
    };

    if (document.getElementById("facebook-jssdk")) return; // init pending
    const sdkScript = document.createElement("script");
    sdkScript.id = "facebook-jssdk";
    sdkScript.src = "https://connect.facebook.net/en_US/sdk.js";
    sdkScript.async = true;
    sdkScript.defer = true;
    sdkScript.crossOrigin = "anonymous";
    document.body.appendChild(sdkScript);
  });
}

// ── State ────────────────────────────────────────────────────────────────────

/** Meta connection state (REST poll — the Cloud API has no SSE stream). */
export function useMetaWAState() {
  return useQuery<MetaWAState>({
    queryKey: ["wa-meta-state"],
    queryFn: getMetaWAState,
    refetchInterval: (query) =>
      query.state.data?.status === "CONNECTED" ? 30_000 : false,
  });
}

function invalidateWAStatuses(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ["wa-meta-state"] });
  queryClient.invalidateQueries({ queryKey: ["wa-unified-status"] });
}

// ── Manual / dev connect ─────────────────────────────────────────────────────

/**
 * Connects WhatsApp using credentials pasted from the Meta "API Setup" page.
 * Used until the app is approved as a Tech Provider for Embedded Signup.
 */
export function useMetaManualConnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MetaManualConnectPayload) =>
      connectMetaManual(payload),
    onSuccess: (state) => {
      queryClient.setQueryData<MetaWAState>(["wa-meta-state"], state);
      invalidateWAStatuses(queryClient);
      toast.success(
        `WhatsApp connected${state.phoneNumber ? ` — ${state.phoneNumber}` : ""}`,
      );
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "WhatsApp connection failed")),
  });
}

// ── Disconnect ───────────────────────────────────────────────────────────────

export function useMetaDisconnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectMetaWA,
    onSuccess: () => {
      toast.success("WhatsApp disconnected");
      invalidateWAStatuses(queryClient);
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to disconnect")),
  });
}

// ── Embedded Signup / OAuth ──────────────────────────────────────────────────

/**
 * Drives Meta's WhatsApp Embedded Signup:
 *  1. Fetches the FB SDK params from the server and loads the SDK.
 *  2. A `message` listener captures `waba_id` + `phone_number_id` from the
 *     signup session (Meta posts these from facebook.com during the flow).
 *  3. `FB.login({ config_id })` opens Meta's hosted popup; on finish it returns
 *     a one-time `code`.
 *  4. The code + captured ids are sent to /whatsapp/meta/oauth/exchange, which
 *     connects the WABA and returns the fresh state.
 */
export function useMetaEmbeddedSignup() {
  const queryClient = useQueryClient();
  // Session info arrives via a separate message event, before FB.login's callback.
  const sessionRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  const exchangeMutation = useMutation({
    mutationFn: (payload: MetaOAuthExchangePayload) =>
      exchangeMetaOAuthCode(payload),
    onSuccess: (state) => {
      queryClient.setQueryData<MetaWAState>(["wa-meta-state"], state);
      invalidateWAStatuses(queryClient);
      toast.success(
        `WhatsApp connected${state.phoneNumber ? ` — ${state.phoneNumber}` : ""}`,
      );
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "WhatsApp connection failed")),
  });

  // Capture the WABA / phone-number ids Meta emits during Embedded Signup.
  useEffect(() => {
    const handleSignupMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const signupEvent =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (signupEvent?.type !== "WA_EMBEDDED_SIGNUP") return;

        if (signupEvent.event === "FINISH") {
          sessionRef.current = {
            wabaId: signupEvent.data?.waba_id,
            phoneNumberId: signupEvent.data?.phone_number_id,
          };
        } else {
          // CANCEL / ERROR — clear any stale capture.
          sessionRef.current = {};
        }
      } catch {
        // Non-JSON cross-frame chatter — ignore.
      }
    };
    window.addEventListener("message", handleSignupMessage);
    return () => window.removeEventListener("message", handleSignupMessage);
  }, []);

  /** Opens the Embedded Signup popup. Call this from the "Connect via Meta" button. */
  const openSignup = useCallback(async () => {
    // Facebook Login blocks FB.login() on non-HTTPS pages, so the popup never
    // opens and the flow dies silently. Catch it early with a clear message.
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:"
    ) {
      toast.error(
        "Connecting via Meta requires HTTPS. Open the app over an https URL and try again.",
      );
      return;
    }

    try {
      const signupConfig = await getMetaSignupConfig();
      if (
        !signupConfig.configured ||
        !signupConfig.appId ||
        !signupConfig.configId
      ) {
        toast.error("Meta WhatsApp signup isn't configured yet.");
        return;
      }

      sessionRef.current = {};
      await loadFacebookSdk(signupConfig.appId, signupConfig.graphVersion);

      if (!window.FB) {
        toast.error(
          "WhatsApp login couldn't load. Check your connection and try again.",
        );
        return;
      }

      window.FB.login(
        (response) => {
          const code = response?.authResponse?.code;
          const { wabaId, phoneNumberId } = sessionRef.current;

          if (!code) {
            toast.error("WhatsApp connection was cancelled.");
            return;
          }
          if (!wabaId || !phoneNumberId) {
            toast.error(
              "Couldn't read your WhatsApp account. Complete the Meta popup, or use manual connect.",
            );
            return;
          }
          exchangeMutation.mutate({ code, wabaId, phoneNumberId });
        },
        {
          config_id: signupConfig.configId,
          response_type: "code",
          override_default_response_type: true,
          extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
        },
      );
    } catch (error) {
      // Covers a synchronous FB.login throw plus any config/SDK-load failure.
      toast.error(
        extractErrorMessage(error, "Could not start WhatsApp signup"),
      );
    }
  }, [exchangeMutation]);

  return {
    openSignup,
    isConnecting: exchangeMutation.isPending,
  };
}
