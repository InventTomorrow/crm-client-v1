"use client";
import {
  useInviteUser,
  useMe,
  useMembers,
  useRemoveMember,
  useUpdateMe,
} from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useWAState } from "@/features/channels/hooks/useWhatsApp";
import { usePresignedUpload } from "@/features/inventory/hooks/useProducts";
import {
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "@/features/notifications/hooks/useNotifications";
import type { NotificationType } from "@/features/notifications/types";
import { cn } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { CRMSwitch } from "@/shared/ui/CRMSwitch";
import { WAConnectDialog } from "@/shared/ui/WAConnectDialog";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Activity,
  Bell,
  Bot,
  Building2,
  Check,
  Cloud,
  Crown,
  Link,
  Loader2,
  Lock,
  Shield,
  Star,
  Store,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SettingsSection } from "../types";
import { SECTION_NAV, SYSTEM_STATS } from "../types";
import { BusinessSection } from "./BusinessSection";
import { ChatbotSection } from "./ChatbotSection";
import { TeamSection } from "./TeamSection";
import { WorkspacesManagementView } from "./WorkspacesManagementView";

const SECTION_ICONS: Record<SettingsSection, React.ElementType> = {
  profile: User,
  notif: Bell,
  chatbot: Bot,
  business: Store,
  channels: Link,
  tier: Crown,
  access: Shield,
  workspaces: Building2,
  system: Activity,
};

// ──────────────────── Profile form schema ────────────────────
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// ──────────────────── Metric ────────────────────
function Metric({ label, v, pct }: { label: string; v: string; pct: number }) {
  return (
    <div className="card p-3 bg-[var(--surface)]">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
        {label}
      </div>
      <div className="font-semibold mt-1 text-[18px] text-[var(--ink)] font-[var(--font-head)]">
        {v}
      </div>
      <div className="h-1 rounded-full overflow-hidden mt-2 bg-[var(--line)]">
        <div
          className="h-full bg-[var(--accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ──────────────────── Profile Section ────────────────────
function ProfileSection() {
  const { user, isLoading } = useMe();
  const { mutate: saveProfile, isPending: isSaving } = useUpdateMe();
  const { upload: uploadImage, isPending: isUploading } =
    usePresignedUpload("avatars");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", avatarUrl: "" },
  });

  const avatarUrl = form.watch("avatarUrl") || "";

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        avatarUrl: user.avatarUrl ?? "",
      });
    }
  }, [user, form]);

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Your Name";
  const displayEmail = user?.email ?? "";
  const currentMembership = user?.memberships?.[0];
  const workspaceName = currentMembership?.tenant?.name ?? "";
  const roleName = currentMembership?.role?.name ?? "";

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const url = await uploadImage(file);
      form.setValue("avatarUrl", url, { shouldDirty: true });
    } catch {
      // error toast already shown by usePresignedUpload's onError
    }
  };

  const handleSave = (data: ProfileFormValues) => {
    saveProfile(
      {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
        avatarUrl: data.avatarUrl || undefined,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-semibold">Profile</h2>
      <div className="card p-[22px]">
        <div className="flex items-center gap-4 mb-5">
          <CRMAvatar
            name={fullName}
            src={avatarUrl || null}
            size={64}
            ring
          />
          <div>
            <h4 className="text-[15px] font-semibold">{fullName}</h4>
            <div className="text-[12.5px] text-[var(--ink-mute)]">
              {workspaceName}
              {workspaceName && roleName ? " · " : ""}
              {roleName}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload size={12} /> Upload photo
                </>
              )}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  value={displayEmail}
                  readOnly
                  className="opacity-60 cursor-not-allowed"
                />
              </FormItem>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 0000000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div
                className={`text-[12.5px] flex items-center gap-1.5 ${saved ? "text-[#15803D]" : "text-[var(--ink-mute)]"}`}
              >
                {saved && (
                  <>
                    <Check size={13} /> Saved successfully
                  </>
                )}
                {!saved && form.formState.isDirty && "Unsaved changes"}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={!form.formState.isDirty || isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isDirty || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Save changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}

// ──────────────────── Notifications Section ────────────────────
const NOTIF_META: Record<NotificationType, { title: string; desc: string }> = {
  NEW_MESSAGE: {
    title: "New message",
    desc: "When a lead sends you a new message.",
  },
  CHAT_ESCALATED: {
    title: "Chat escalated",
    desc: "When a conversation is flagged for attention.",
  },
  NEW_LEAD: {
    title: "New lead",
    desc: "When a new lead is created or imported.",
  },
  LEAD_ASSIGNED: {
    title: "Lead assigned",
    desc: "When a lead is assigned to you.",
  },
  ORDER_CREATED: {
    title: "Order created",
    desc: "When a new order is placed.",
  },
  ORDER_STATUS_CHANGED: {
    title: "Order status changed",
    desc: "When an order status is updated.",
  },
  MEMBER_INVITED: {
    title: "Member invited",
    desc: "When someone is invited to your workspace.",
  },
  MEMBER_JOINED: {
    title: "Member joined",
    desc: "When an invited member accepts and joins.",
  },
  BROADCAST_COMPLETED: {
    title: "Broadcast completed",
    desc: "When a broadcast campaign finishes.",
  },
  NEW_LOGIN: {
    title: "New login",
    desc: "When your account is accessed from a new device.",
  },
  BILLING: {
    title: "Billing",
    desc: "Payment confirmations and plan changes.",
  },
};

function NotifSection() {
  const { data: prefs = [], isLoading } = useNotificationPreferences();
  const { mutate: update } = useUpdateNotificationPreference();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-semibold">Notifications</h2>
      <div className="card overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_64px_64px] gap-2 px-4 py-2 border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
          <span>Event</span>
          <span className="text-center">In-app</span>
          <span className="text-center">Email</span>
        </div>
        {(Object.keys(NOTIF_META) as NotificationType[]).map((type, i) => {
          const pref = prefs.find((p) => p.type === type);
          const meta = NOTIF_META[type];
          const last = i === Object.keys(NOTIF_META).length - 1;
          return (
            <div
              key={type}
              className={cn(
                "grid grid-cols-[1fr_64px_64px] gap-2 items-center px-4 py-3",
                !last && "border-b border-[var(--line-soft)]",
              )}
            >
              <div>
                <div className="font-medium text-[13.5px]">{meta.title}</div>
                <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
                  {meta.desc}
                </div>
              </div>
              <div className="flex justify-center">
                <CRMSwitch
                  on={pref?.inApp ?? true}
                  onChange={(v) => update({ type, inApp: v })}
                  size="md"
                />
              </div>
              <div className="flex justify-center">
                <CRMSwitch
                  on={pref?.email ?? false}
                  onChange={(v) => update({ type, email: v })}
                  size="md"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[11.5px] flex items-center gap-1.5 text-[var(--ink-mute)]">
        <Check size={12} className="text-[#15803D]" /> Preferences save
        automatically
      </div>
    </>
  );
}

// ──────────────────── Channels Section ────────────────────
function ChannelsSection() {
  const { data: statusData } = useWAState();
  const { can } = usePermissions();
  const [waOpen, setWaOpen] = useState(false);
  const status = statusData?.status ?? "DISCONNECTED";
  const canConnect = can("channels:connect");

  return (
    <>
      <h2 className="text-[20px] font-semibold">Connected Channels</h2>
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#25D366" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[14px]">WhatsApp Business</div>
            <div className="text-[12px] text-[var(--ink-mute)] mt-px">
              {status === "CONNECTED"
                ? `Connected · +${statusData?.phoneNumber ?? ""}`
                : "Not connected — link your number via Meta"}
            </div>
          </div>
          <span
            className={cn(
              "badge font-medium px-2.5 py-1",
              status === "CONNECTED"
                ? "bg-[rgba(34,197,94,0.12)] text-[#15803D]"
                : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
            )}
          >
            <span
              className={cn(
                "w-[6px] h-[6px] rounded-full mr-1.5 inline-block",
                status === "CONNECTED"
                  ? "bg-[#15803D]"
                  : "bg-[var(--ink-mute)]",
              )}
            />
            {status === "CONNECTED"
              ? "Connected"
              : status === "ERROR"
                ? "Error"
                : "Disconnected"}
          </span>
          {canConnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWaOpen(true)}
            >
              {status === "CONNECTED" ? "Manage" : "Connect"}
            </Button>
          )}
        </div>
        {!canConnect && (
          <p className="text-[11.5px] text-[var(--ink-mute)] mt-3">
            You don&apos;t have permission to connect or disconnect WhatsApp. Ask a
            workspace owner.
          </p>
        )}
      </div>
      <WAConnectDialog open={waOpen} onOpenChange={setWaOpen} />
    </>
  );
}

// ──────────────────── Tier Section ────────────────────
function TierSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">Integration Tier</h2>
      <div className="card p-[22px] border-[var(--accent)] bg-[var(--accent-soft)]">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--accent)] text-white">
            <Crown size={20} />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-semibold">
                Tier 3 · Storefront API
              </h3>
              <span className="badge font-medium text-white bg-[var(--accent)]">
                Current
              </span>
            </div>
            <div className="text-[13px] mt-1 text-[var(--ink-soft)]">
              Live two-way sync with Shopify + Daraz. AI suggestions enabled.
              12,000 messages / month.
            </div>
          </div>
          <Button className="flex-shrink-0">
            <Zap size={14} /> Upgrade to ERP
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <Metric label="Messages used" v="8,420 / 12K" pct={70} />
          <Metric label="AI credits" v="4.2K / 10K" pct={42} />
          <Metric label="Storage" v="2.1 / 50 GB" pct={4} />
        </div>
      </div>
    </>
  );
}

// ──────────────────── System Section ────────────────────
const SYSTEM_ICONS = [Star, Activity, Lock, Cloud] as const;

function SystemSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">System Status</h2>
      <div className="card p-[22px] bg-[#0F172A] text-white border border-[rgba(255,255,255,0.08)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              All systems operational
            </h3>
            <div className="text-[12px] mt-1 text-[rgba(255,255,255,0.6)]">
              Last checked just now
            </div>
          </div>
          <span className="badge font-medium bg-[rgba(34,197,94,0.2)] text-[#86EFAC]">
            ● Healthy
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {SYSTEM_STATS.map((s, i) => {
            const Icon = SYSTEM_ICONS[i];
            return (
              <div
                key={i}
                className="rounded-[10px] p-3.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <Icon size={15} className="text-[#C4B5FD]" />
                  <span
                    className={`dot ${s.ok ? "bg-[#22C55E]" : "bg-[#EF4444]"}`}
                  />
                </div>
                <div className="font-semibold mt-2 text-[18px] font-[var(--font-head)]">
                  {s.v}
                </div>
                <div className="text-[11.5px] text-[rgba(255,255,255,0.65)]">
                  {s.l}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Per-tab permission gate. Tabs without an entry (profile, notifications) are
// always available — they only expose the signed-in user's own data.
const SECTION_PERMISSION: Partial<Record<SettingsSection, string>> = {
  chatbot: "chatbot:view",
  business: "settings:view",
  channels: "channels:view",
  access: "members:view",
  workspaces: "settings:edit",
};

// ──────────────────── SettingsView (root) ────────────────────
export function SettingsView() {
  const { can, isLoading: permsLoading } = usePermissions();
  const [section, setSection] = useState<SettingsSection>("profile");

  // Hide tabs the active role can't access (placeholder tabs stay visible but
  // disabled, as before).
  const visibleNav = SECTION_NAV.filter((s) => {
    const perm = SECTION_PERMISSION[s.id];
    return !perm || can(perm);
  });

  // If the current section became inaccessible, fall back to Profile.
  useEffect(() => {
    if (permsLoading) return;
    if (!visibleNav.some((s) => s.id === section)) setSection("profile");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permsLoading, section]);

  return (
    <div className="flex gap-3.5 h-full overflow-hidden p-[18px]">
      {/* Sidebar nav */}
      <div className="card flex-shrink-0 flex flex-col gap-1 h-fit p-3.5 w-[220px]">
        <div className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1.5 text-[var(--ink-mute)]">
          Settings
        </div>
        {visibleNav.map((s) => {
          const Icon = SECTION_ICONS[s.id];
          const active = section === s.id;
          const disabled = (["tier", "system"] as SettingsSection[]).includes(
            s.id,
          );
          return (
            <Button
              key={s.id}
              variant="ghost"
              onClick={() => !disabled && setSection(s.id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] text-left w-full justify-start h-auto",
                disabled
                  ? "opacity-35 cursor-not-allowed text-[var(--ink-soft)] font-medium"
                  : active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold hover:bg-[var(--accent-soft)]"
                    : "bg-transparent text-[var(--ink-soft)] font-medium",
              )}
            >
              <Icon size={15} />
              <span className="flex-1">{s.label}</span>
              {disabled && (
                <span className="text-[9.5px] font-medium tracking-wide uppercase text-[var(--ink-mute)] opacity-70">
                  Soon
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      <div
        className={cn(
          "scroll flex-1 overflow-y-auto flex flex-col gap-3.5",
          section === "workspaces" && "p-0 gap-0",
        )}
      >
        {section === "profile" && <ProfileSection />}
        {section === "notif" && <NotifSection />}
        {section === "chatbot" && <ChatbotSection />}
        {section === "business" && <BusinessSection />}
        {section === "channels" && <ChannelsSection />}
        {section === "tier" && <TierSection />}
        {section === "access" && <TeamSection />}
        {section === "workspaces" && <WorkspacesManagementView />}
        {section === "system" && <SystemSection />}
      </div>
    </div>
  );
}
