"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  disconnectWA,
  exchangeWAOAuthCode,
  getWAConfig,
  getWASignupConfig,
  getWAState,
  manualConnectWA,
  updateWAConfig,
} from "../services/channelsService";
import type {
  ManualConnectData,
  OAuthExchangePayload,
  WAConfig,
  WAState,
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
    const js = document.createElement("script");
    js.id = "facebook-jssdk";
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.async = true;
    js.defer = true;
    js.crossOrigin = "anonymous";
    document.body.appendChild(js);
  });
}

// ── State polling ──────────────────────────────────────────────────────────

/**
 * Polls the server for the current WhatsApp channel state.
 * Polls every 5 s while disconnected (catching a freshly completed OAuth),
 * then backs off to 30 s once connected.
 */
export function useWAState() {
  return useQuery<WAState>({
    queryKey: ["wa-state"],
    queryFn: getWAState,
    refetchInterval: (query) =>
      query.state.data?.status === "CONNECTED" ? 30_000 : 5_000,
  });
}

// ── Config ─────────────────────────────────────────────────────────────────

export function useWAConfig() {
  return useQuery({ queryKey: ["wa-config"], queryFn: getWAConfig });
}

export function useUpdateWAConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<WAConfig>) => updateWAConfig(config),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["wa-config"] });
      const prev = queryClient.getQueryData<WAConfig>(["wa-config"]);
      queryClient.setQueryData<WAConfig>(["wa-config"], (old: any) => ({
        ...old,
        ...next,
      }));
      return { prev };
    },
    onError: (error, _vars, ctx) => {
      toast.error(extractErrorMessage(error, "Failed to update settings"));
      if (ctx?.prev) queryClient.setQueryData(["wa-config"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wa-config"] }),
  });
}

// ── Disconnect ─────────────────────────────────────────────────────────────

export function useWADisconnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectWA,
    onSuccess: () => {
      toast.success("WhatsApp disconnected");
      queryClient.invalidateQueries({ queryKey: ["wa-state"] });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to disconnect")),
  });
}

// ── Manual / dev connect ───────────────────────────────────────────────────

/**
 * Connects WhatsApp using credentials pasted from the Meta "API Setup" page.
 * Used until the app is approved as a Tech Provider for Embedded Signup.
 */
export function useWAManualConnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManualConnectData) => manualConnectWA(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<WAState>(["wa-state"], data);
      queryClient.invalidateQueries({ queryKey: ["wa-state"] });
      toast.success(
        `WhatsApp connected${data.phoneNumber ? ` — ${data.phoneNumber}` : ""}`,
      );
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "WhatsApp connection failed")),
  });
}

// ── Embedded Signup / OAuth ────────────────────────────────────────────────

/**
 * Drives Meta's WhatsApp Embedded Signup:
 *  1. Fetches the FB SDK params from the server and loads the SDK.
 *  2. A `message` listener captures `waba_id` + `phone_number_id` from the
 *     signup session (Meta posts these from facebook.com during the flow).
 *  3. `FB.login({ config_id })` opens Meta's hosted popup; on finish it returns
 *     a one-time `code`.
 *  4. The code + captured ids are sent to /whatsapp/oauth/exchange, which
 *     connects the WABA and returns the fresh WAState.
 */
export function useWAEmbeddedSignup() {
  const queryClient = useQueryClient();
  // Session info arrives via a separate message event, before FB.login's callback.
  const sessionRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  const exchangeMutation = useMutation({
    mutationFn: (payload: OAuthExchangePayload) => exchangeWAOAuthCode(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<WAState>(["wa-state"], data);
      queryClient.invalidateQueries({ queryKey: ["wa-state"] });
      toast.success(
        `WhatsApp connected${data.phoneNumber ? ` — ${data.phoneNumber}` : ""}`,
      );
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "WhatsApp connection failed")),
  });

  // Capture the WABA / phone-number ids Meta emits during Embedded Signup.
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        // Log every message Meta posts so we can see what (if anything) the
        // signup session emits. A correct WhatsApp Embedded Signup config sends
        // type "WA_EMBEDDED_SIGNUP" with event "FINISH" + data.{waba_id,phone_number_id}.
        console.info("[WA Signup] message from facebook.com:", data);
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
        console.info(
          `[WA Signup] WA_EMBEDDED_SIGNUP event="${data.event}" data=`,
          data.data,
        );
        if (data.event === "FINISH") {
          sessionRef.current = {
            wabaId: data.data?.waba_id,
            phoneNumberId: data.data?.phone_number_id,
          };
          console.info("[WA Signup] captured session:", sessionRef.current);
        } else {
          // CANCEL / ERROR — clear any stale capture.
          sessionRef.current = {};
          console.warn(`[WA Signup] session cleared (event=${data.event})`);
        }
      } catch {
        // Non-JSON cross-frame chatter — ignore.
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /** Opens the Embedded Signup popup. Call this from the "Connect WhatsApp" button. */
  const openSignup = useCallback(async () => {
    // Facebook Login blocks FB.login() on non-HTTPS pages, so the popup never
    // opens and the flow dies silently. Catch it early with a clear message
    // instead of letting the SDK throw scary console errors.
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:"
    ) {
      toast.error(
        "Connecting WhatsApp requires HTTPS. Open the app over an https URL (e.g. your ngrok/production link) and try again.",
      );
      return;
    }

    try {
      const cfg = await getWASignupConfig();
      if (!cfg.appId || !cfg.configId) {
        toast.error("WhatsApp signup isn't configured yet.");
        return;
      }

      sessionRef.current = {};
      console.info("[WA Signup] config:", {
        appId: cfg.appId,
        configId: cfg.configId,
        graphVersion: cfg.graphVersion,
      });
      await loadFacebookSdk(cfg.appId, cfg.graphVersion);

      if (!window.FB) {
        toast.error(
          "WhatsApp login couldn't load. Check your connection and try again.",
        );
        return;
      }
      console.info("[WA Signup] FB SDK loaded, opening FB.login…");

      window.FB.login(
        (response) => {
          const code = response?.authResponse?.code;
          const { wabaId, phoneNumberId } = sessionRef.current;
          console.info("[WA Signup] FB.login callback:", {
            status: response?.status,
            hasCode: !!code,
            wabaId,
            phoneNumberId,
          });

          if (!code) {
            console.warn("[WA Signup] no code in FB.login response", response);
            toast.error("WhatsApp connection was cancelled.");
            return;
          }
          if (!wabaId || !phoneNumberId) {
            console.warn(
              "[WA Signup] code received but no waba_id/phone_number_id — the message event never fired. Likely a non-WhatsApp-Embedded-Signup config_id.",
            );
            toast.error(
              "Couldn't read your WhatsApp account. Make sure you complete the Meta popup, or use manual connect.",
            );
            return;
          }
          console.info("[WA Signup] exchanging code with server…");
          exchangeMutation.mutate({ code, wabaId, phoneNumberId });
        },
        {
          config_id: cfg.configId,
          response_type: "code",
          override_default_response_type: true,
          extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
        },
      );
    } catch (error) {
      // Covers a synchronous FB.login throw (e.g. HTTP enforcement) plus any
      // config/SDK-load failure — surface it instead of crashing the page.
      console.error("[WA Signup] openSignup failed:", error);
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
