"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Cloud, KeyRound, Loader2, Unplug } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useMetaDisconnect,
  useMetaEmbeddedSignup,
  useMetaManualConnect,
  useMetaWAState,
} from "../hooks/useMetaWhatsApp";
import {
  metaManualConnectSchema,
  type MetaManualConnectPayload,
} from "../types";

const WA_GREEN = "#25D366";

/** Dev / single-tenant connect with credentials from the Meta "API Setup" page. */
function ManualConnectForm({ onDone }: { onDone: () => void }) {
  const manualConnectMutation = useMetaManualConnect();
  const form = useForm<MetaManualConnectPayload>({
    resolver: zodResolver(metaManualConnectSchema),
    defaultValues: { wabaId: "", phoneNumberId: "", accessToken: "" },
  });

  const handleSubmit = (payload: MetaManualConnectPayload) => {
    manualConnectMutation.mutate(payload, { onSuccess: onDone });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-3"
      >
        <FormField
          control={form.control}
          name="wabaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px]">WABA ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 1046…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px]">Phone Number ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 1122…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px]">Access Token</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Paste the API-Setup token"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="sm"
          className="mt-1"
          disabled={manualConnectMutation.isPending}
        >
          {manualConnectMutation.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <KeyRound size={13} />
          )}
          Connect with credentials
        </Button>
      </form>
    </Form>
  );
}

/**
 * Meta Cloud API channel card for the WhatsApp page: connect via Embedded
 * Signup (OAuth popup) or manually with API-Setup credentials. Mutually
 * exclusive with the QR (Baileys) provider — the parent disables this card
 * while a QR session is connected.
 */
export function MetaConnectWidget({ className }: { className?: string }) {
  const { can } = usePermissions();
  const canManage = can("channels:connect");
  const { data: metaState } = useMetaWAState();
  const { openSignup, isConnecting } = useMetaEmbeddedSignup();
  const disconnectMutation = useMetaDisconnect();
  const [showManualForm, setShowManualForm] = useState(false);

  const status = metaState?.status ?? "DISCONNECTED";
  const isConnected = status === "CONNECTED";
  const hasError = status === "ERROR";

  return (
    <div
      className={cn(
        "card relative flex h-full flex-col overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--line)] p-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
            isConnected ? "text-white shadow-sm" : "text-[var(--ink-mute)]",
          )}
          style={{ background: isConnected ? WA_GREEN : "var(--surface-2)" }}
        >
          <Cloud size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-[var(--ink)]">
            WhatsApp Business API
          </div>
          <div className="text-[11.5px] text-[var(--ink-mute)]">
            {isConnected && metaState?.phoneNumber
              ? metaState.phoneNumber
              : "Official Meta Cloud API — no phone linked"}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
            isConnected && "bg-[rgba(37,211,102,0.12)] text-[#15803D]",
            hasError && "bg-[rgba(220,38,38,0.10)] text-[#B91C1C]",
            !isConnected &&
              !hasError &&
              "bg-[var(--surface-2)] text-[var(--ink-mute)]",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isConnected && "bg-[#25D366]",
              hasError && "bg-[#DC2626]",
              !isConnected && !hasError && "bg-[var(--ink-mute)] opacity-60",
            )}
          />
          {isConnected ? "Connected" : hasError ? "Error" : "Disconnected"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-center gap-3 p-4">
        {isConnected ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(37,211,102,0.12)]">
              <CheckCircle2 size={24} className="text-[#25D366]" />
            </div>
            <p className="text-[13px] text-[var(--ink)]">
              Connected via Meta Cloud API
            </p>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Unplug size={13} />
                )}
                Disconnect
              </Button>
            )}
          </div>
        ) : !canManage ? (
          <p className="py-4 text-center text-[12.5px] text-[var(--ink-mute)]">
            You don&apos;t have permission to connect channels.
          </p>
        ) : showManualForm ? (
          <>
            <ManualConnectForm onDone={() => setShowManualForm(false)} />
            <button
              type="button"
              className="text-[12px] text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
              onClick={() => setShowManualForm(false)}
            >
              ← Back to Facebook login
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            {hasError && metaState?.errorMessage && (
              <p className="text-center text-[12px] text-[#B91C1C]">
                {metaState.errorMessage}
              </p>
            )}
            <p className="text-center text-[12px] text-[var(--ink-mute)]">
              Connect your WhatsApp Business number through Meta&apos;s official
              API — no phone pairing required.
            </p>
            <Button size="sm" onClick={openSignup} disabled={isConnecting}>
              {isConnecting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Cloud size={13} />
              )}
              Connect with Facebook
            </Button>
            <button
              type="button"
              className="text-[11.5px] text-[var(--ink-mute)] underline-offset-2 transition-colors hover:text-[var(--ink)] hover:underline"
              onClick={() => setShowManualForm(true)}
            >
              Connect manually with API credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
