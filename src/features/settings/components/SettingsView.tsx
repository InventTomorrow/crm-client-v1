"use client";
import { useMe, useUpdateMe } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { NotificationPreferences } from "@/features/notifications/components/NotificationPreferences";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
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
  User,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { SettingsSection } from "../types";
import { SECTION_NAV, SYSTEM_STATS } from "../types";
import { BusinessSection } from "./BusinessSection";
// import { ChannelsSection } from "./ChannelsSection";
import { ChatbotSection } from "./ChatbotSection";
import { TeamSection } from "./TeamSection";
import { WorkspacesManagementView } from "./WorkspacesManagementView";

// Used by the in-page section nav, currently commented out in SettingsView.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SECTION_ICONS: Record<SettingsSection, React.ElementType> = {
  profile: User,
  chatbot: Bot,
  business: Store,
  channels: Link,
  notifications: Bell,
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
          <CRMAvatar name={fullName} src={avatarUrl || null} size={64} ring />
          <div>
            <h4 className="text-[15px] font-semibold">{fullName}</h4>
            <div className="text-[12.5px] text-[var(--ink-mute)]">
              {workspaceName}
              {workspaceName && roleName ? " · " : ""}
              {roleName}
            </div>
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
function NotificationsSection() {
  return (
    <>
      <h2 className="text-[20px] font-semibold">Notifications</h2>
      <div className="max-w-2xl">
        <NotificationPreferences />
      </div>
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

// Per-tab permission gate. Tabs without an entry (profile) are always
// available — they only expose the signed-in user's own data.
const SECTION_PERMISSION: Partial<Record<SettingsSection, string>> = {
  chatbot: "chatbot:view",
  business: "settings:view",
  channels: "channels:view",
  access: "members:view",
  workspaces: "settings:edit",
};

// Tabs that configure the workspace itself (billing tier, team access, other
// workspaces, system health) rather than day-to-day operation — visible to
// the workspace owner only. Chatbot/Business/Channels stay available to any
// permitted role since they're used to run the workspace.
const SECTION_OWNER_ONLY = new Set<SettingsSection>([
  "tier",
  "access",
  "workspaces",
  "system",
]);

// ──────────────────── SettingsView (root) ────────────────────
export function SettingsView() {
  const { can, isOwner } = usePermissions();
  // The section is driven entirely by `?section=` — the sidebar's Settings
  // submenu is the tab bar now (the in-page nav below is kept, commented out).
  const requestedSection = useSearchParams().get(
    "section",
  ) as SettingsSection | null;

  // Hide tabs the active role can't access (placeholder tabs stay visible but
  // disabled, as before).
  const visibleNav = SECTION_NAV.filter((s) => {
    if (SECTION_OWNER_ONLY.has(s.id) && !isOwner) return false;
    const perm = SECTION_PERMISSION[s.id];
    return !perm || can(perm);
  });

  // An unknown or inaccessible section falls back to Profile.
  const section: SettingsSection =
    requestedSection && visibleNav.some((s) => s.id === requestedSection)
      ? requestedSection
      : "profile";

  return (
    <div className="settings-layout flex gap-3.5 h-full overflow-hidden p-[18px]">
      {/* Sidebar nav — moved into the app sidebar's Settings submenu. Kept here
          so it can be restored by un-commenting this block and the mobile
          back-button below.
      <div
        className={cn(
          "settings-nav card shrink-0 flex flex-col gap-1 h-fit p-3.5 w-[220px]",
          mobShowNav && "mob-on",
        )}
      >
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
              onClick={() => {
                if (disabled) return;
                setSection(s.id);
                setMobShowNav(false);
              }}
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
      */}

      {/* Content */}
      <div
        className={cn(
          // Sections must keep their natural height — without shrink-0 a tall
          // section is squeezed by the flex column instead of scrolling.
          "settings-content mob-on scroll flex-1 overflow-y-auto flex flex-col gap-3.5 *:shrink-0",
          section === "workspaces" && "p-0 gap-0",
        )}
      >
        {/* Mobile back-link into the in-page nav — restore with the block above
            (needs the ChevronLeft import back).
        <button
          type="button"
          onClick={() => setMobShowNav(true)}
          className="settings-back-mobile items-center gap-1.5 text-[13px] font-medium text-[var(--ink-soft)] px-1 pt-1"
        >
          <ChevronLeft size={16} />
          Settings
          <span className="text-[var(--ink-mute)]">/</span>
          <span className="text-[var(--ink)]">
            {visibleNav.find((s) => s.id === section)?.label}
          </span>
        </button>
        */}
        {section === "profile" && <ProfileSection />}
        {section === "chatbot" && <ChatbotSection />}
        {section === "business" && <BusinessSection />}
        {/* {section === "channels" && <ChannelsSection />} */}
        {section === "notifications" && <NotificationsSection />}
        {section === "tier" && <TierSection />}
        {section === "access" && <TeamSection />}
        {section === "workspaces" && <WorkspacesManagementView />}
        {section === "system" && <SystemSection />}
      </div>
    </div>
  );
}
