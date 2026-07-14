"use client";

import {
  useCancelInvitation,
  useChangeMemberRole,
  useInvitations,
  useInviteUser,
  useMembers,
  useRemoveMember,
  useRoles,
  useUpdateRolePermissions,
} from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import type {
  InvitationItem,
  MemberItem,
  RoleItem,
} from "@/features/auth/services/authService";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { Checkbox } from "@/shared/ui/Checkbox";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Input } from "@/shared/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/Sheet";
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
  CalendarDays,
  Check,
  Clock,
  Info,
  Loader2,
  Mail,
  Pencil,
  Save,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Skeleton } from "@/shared/ui/Skeleton";

import { inviteMemberSchema, type InviteMemberForm } from "../types";

// ── Permission catalogue (mirrors server constants) ──────────────────────────
const PERMISSION_GROUPS = [
  {
    group: "Dashboard",
    perms: [{ key: "dashboard:view", label: "View Dashboard" }],
  },
  {
    group: "Leads",
    perms: [
      { key: "leads:view", label: "View Leads" },
      { key: "leads:create", label: "Create Leads" },
      { key: "leads:edit", label: "Edit Leads" },
      { key: "leads:delete", label: "Delete Leads" },
      { key: "leads:export", label: "Export Leads" },
    ],
  },
  {
    group: "Conversations",
    perms: [
      { key: "conversations:view", label: "View Conversations" },
      { key: "conversations:reply", label: "Reply" },
      { key: "conversations:assign", label: "Assign" },
      { key: "conversations:close", label: "Close" },
    ],
  },
  {
    group: "Orders",
    perms: [
      { key: "orders:view", label: "View Orders" },
      { key: "orders:create", label: "Create Orders" },
      { key: "orders:edit", label: "Edit Orders" },
      { key: "orders:cancel", label: "Cancel Orders" },
      { key: "orders:export", label: "Export Orders" },
    ],
  },
  {
    group: "Inventory",
    perms: [
      { key: "inventory:view", label: "View Inventory" },
      { key: "inventory:edit", label: "Edit Inventory" },
    ],
  },
  {
    group: "Broadcasts",
    perms: [
      { key: "broadcasts:view", label: "View Broadcasts" },
      { key: "broadcasts:create", label: "Create Broadcasts" },
      { key: "broadcasts:send", label: "Send Broadcasts" },
    ],
  },
  {
    group: "Reports",
    perms: [
      { key: "reports:view", label: "View Reports" },
      { key: "reports:export", label: "Export Reports" },
    ],
  },
  {
    group: "Settings",
    perms: [
      { key: "settings:view", label: "View Settings" },
      { key: "settings:edit", label: "Edit Settings" },
    ],
  },
  {
    group: "Channels",
    perms: [
      { key: "channels:view", label: "View Channels" },
      { key: "channels:connect", label: "Connect / Disconnect WhatsApp" },
      { key: "api_keys:view", label: "View Website Orders API Keys" },
      { key: "api_keys:manage", label: "Create / Revoke Website Orders API Keys" },
    ],
  },
  {
    group: "Members",
    perms: [
      { key: "members:view", label: "View Members" },
      { key: "members:invite", label: "Invite Members" },
      { key: "members:remove", label: "Remove Members" },
      { key: "members:role_change", label: "Change Roles" },
    ],
  },
  {
    group: "Billing",
    perms: [
      { key: "billing:view", label: "View Billing" },
      { key: "billing:manage", label: "Manage Billing" },
    ],
  },
  {
    group: "Chatbot / AI",
    perms: [
      { key: "chatbot:view", label: "View Chatbot" },
      { key: "chatbot:edit", label: "Edit Chatbot" },
    ],
  },
  {
    group: "Roles",
    perms: [
      { key: "roles:view", label: "View Roles" },
      { key: "roles:edit", label: "Edit Roles" },
    ],
  },
  {
    group: "Knowledge Base",
    perms: [
      { key: "knowledge:view", label: "View Knowledge Base" },
      { key: "knowledge:edit", label: "Edit Knowledge Base" },
    ],
  },
] as const;

const ALL_PERMISSIONS: { key: string; label: string }[] =
  PERMISSION_GROUPS.flatMap((g) =>
    g.perms.map((p) => ({ key: p.key as string, label: p.label as string })),
  );
const ALL_PERMISSION_KEYS = ALL_PERMISSIONS.map((p) => p.key);

// ── Role meta ────────────────────────────────────────────────────────────────
const ROLE_META: Record<string, { color: string; bg: string; desc: string }> = {
  OWNER: {
    color: "text-[#7C3AED]",
    bg: "bg-[rgba(124,58,237,0.12)]",
    desc: "Full access — billing, members, all data.",
  },
  SALES: {
    color: "text-[#2563EB]",
    bg: "bg-[rgba(59,130,246,0.12)]",
    desc: "Leads, conversations, broadcasts.",
  },
  FINANCE: {
    color: "text-[#059669]",
    bg: "bg-[rgba(16,185,129,0.12)]",
    desc: "Orders, reports, billing view.",
  },
  SUPPORT: {
    color: "text-[#D97706]",
    bg: "bg-[rgba(245,158,11,0.12)]",
    desc: "Inbox, lead edits, order view.",
  },
};

const ROLE_ORDER = ["OWNER", "SALES", "FINANCE", "SUPPORT"] as const;

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ name }: { name: string }) {
  const m = ROLE_META[name] ?? {
    color: "text-[var(--ink-soft)]",
    bg: "bg-[var(--surface-2)]",
  };
  return (
    <span
      className={cn(
        "badge font-semibold text-[11px] px-2.5 py-1",
        m.bg,
        m.color,
      )}
    >
      {name}
    </span>
  );
}

// ── Role selector dropdown ────────────────────────────────────────────────────
function RoleSelector({
  value,
  roles,
  onChange,
  disabled,
}: {
  value: string;
  roles: RoleItem[];
  onChange: (roleId: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-[140px] text-[12px]">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {roles
          .filter((r) => r.name !== "OWNER")
          .map((r) => (
            <SelectItem key={r.id} value={r.id}>
              <RoleBadge name={r.name} />
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

// ── Invite member dialog ──────────────────────────────────────────────────────
function InviteMemberDialog({
  open,
  onClose,
  roles,
}: {
  open: boolean;
  onClose: () => void;
  roles: RoleItem[];
}) {
  const { can } = usePermissions();
  const inviteMut = useInviteUser();
  const assignable = useMemo(
    () => roles.filter((r) => r.name !== "OWNER"),
    [roles],
  );
  const [editRole, setEditRole] = useState<RoleItem | null>(null);

  const form = useForm<InviteMemberForm>({
    resolver: zodResolver(inviteMemberSchema),
    // Parent keys this component on open, so it mounts fresh each time.
    defaultValues: {
      email: "",
      roleId: assignable[0]?.id ?? "",
      city: "Lahore",
      phone: "",
    },
  });

  const watchedRoleId = form.watch("roleId");
  const selectedRole = roles.find((r) => r.id === watchedRoleId);
  const previewPerms = useMemo(() => {
    const granted = new Set(selectedRole?.permissions ?? []);
    return ALL_PERMISSIONS.filter((p) => granted.has(p.key)).map(
      (p) => p.label,
    );
  }, [selectedRole]);

  // Briefly show a loading state whenever the role changes, so the permission
  // list visibly "resolves" for the role being assigned.
  const [permsLoading, setPermsLoading] = useState(false);
  useEffect(() => {
    if (!watchedRoleId) return;
    setPermsLoading(true);
    const t = setTimeout(() => setPermsLoading(false), 450);
    return () => clearTimeout(t);
  }, [watchedRoleId]);

  const canEditRole =
    can("roles:edit") && !!selectedRole && selectedRole.name !== "OWNER";

  const onSubmit = (data: InviteMemberForm) => {
    inviteMut.mutate(
      { email: data.email.trim(), roleId: data.roleId },
      { onSuccess: onClose },
    );
  };

  const CITIES = [
    "Lahore",
    "Karachi",
    "Islamabad",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Rawalpindi",
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-5 py-4 border-b border-[var(--line)]">
          <DialogTitle className="text-[17px] font-semibold">
            Invite team member
          </DialogTitle>
          <DialogDescription className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
            They&apos;ll receive an email invite to join your workspace.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col overflow-hidden min-h-0"
          >
            <div className="flex-1 min-h-0 p-5 flex flex-col gap-3.5 overflow-y-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ali@saleflow.pk"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {assignable.map((r) => {
                            const meta = ROLE_META[r.name];
                            return (
                              <SelectItem key={r.id} value={r.id}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "size-1.5 rounded-full bg-current",
                                      meta?.color ?? "text-[var(--ink-mute)]",
                                    )}
                                  />
                                  <span className="capitalize">
                                    {r.name.toLocaleLowerCase()}
                                  </span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CITIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 321 4567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="card p-3 bg-[var(--surface-2)] overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
                    {selectedRole ? (
                      <RoleBadge name={selectedRole.name} />
                    ) : (
                      "Role"
                    )}
                    permissions
                    {!permsLoading && selectedRole && (
                      <span className="normal-case tracking-normal text-[var(--ink-mute)]">
                        ({previewPerms.length})
                      </span>
                    )}
                  </span>
                  {canEditRole && !permsLoading && (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="h-auto p-0 text-[11px]"
                      onClick={() => setEditRole(selectedRole!)}
                    >
                      <Pencil className="size-3" /> Edit permissions
                    </Button>
                  )}
                </div>

                <div className="h-[148px] overflow-y-auto pr-1">
                <AnimatePresence mode="wait" initial={false}>
                  {permsLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-2 gap-x-3 gap-y-1.5"
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Skeleton className="size-3 rounded-full" />
                          <Skeleton className="h-3 flex-1 rounded" />
                        </div>
                      ))}
                    </motion.div>
                  ) : previewPerms.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[12.5px] text-[var(--ink-mute)]"
                    >
                      No permissions granted.
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedRole?.id ?? "perms"}
                      initial="hidden"
                      animate="show"
                      variants={{
                        show: { transition: { staggerChildren: 0.02 } },
                      }}
                      className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12.5px] text-[var(--ink-soft)]"
                    >
                      {previewPerms.map((p) => (
                        <motion.div
                          key={p}
                          variants={{
                            hidden: { opacity: 0, y: 4 },
                            show: { opacity: 1, y: 0 },
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <Check
                            size={12}
                            className="text-[#15803D] flex-shrink-0"
                          />{" "}
                          {p}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 px-5 py-3.5 border-t border-[var(--line)]">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMut.isPending}>
                {inviteMut.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <RolePermissionsSheet
        role={editRole}
        open={!!editRole}
        onOpenChange={(v) => !v && setEditRole(null)}
      />
    </Dialog>
  );
}

// ── Pending invitations ───────────────────────────────────────────────────────
function PendingInvites({ canInvite }: { canInvite: boolean }) {
  const { data: invites = [], isLoading } = useInvitations();
  const { mutate: cancel, isPending: isCancelling } = useCancelInvitation();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString();

  if (isLoading || invites.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--line)]">
        <Clock size={15} className="text-[var(--ink-mute)]" />
        <span className="text-[13px] font-semibold">Pending invitations</span>
        <span className="badge bg-[var(--surface-2)] text-[var(--ink-soft)] text-[11px] px-2">
          {invites.length}
        </span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {invites.map((inv: InvitationItem) => (
          <div
            key={inv.id}
            className="flex items-center gap-3 px-4 py-3 flex-wrap"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-mute)] flex-shrink-0">
              <Mail size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium truncate">
                  {inv.email}
                </span>
                <RoleBadge name={inv.roleName} />
                {inv.expired ? (
                  <span className="badge bg-[rgba(220,38,38,0.1)] text-[#DC2626] text-[10.5px] px-2">
                    Expired
                  </span>
                ) : (
                  <span className="badge bg-[rgba(202,138,4,0.12)] text-[#854D0E] text-[10.5px] px-2">
                    Awaiting response
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-[var(--ink-mute)] mt-0.5">
                {inv.invitedByName ? `Invited by ${inv.invitedByName} · ` : ""}
                Sent {fmtDate(inv.createdAt)} · Expires {fmtDate(inv.expiresAt)}
              </div>
            </div>
            {canInvite &&
              (cancelId === inv.id ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelId(null)}
                    disabled={isCancelling}
                  >
                    Keep
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                    disabled={isCancelling}
                    onClick={() =>
                      cancel(inv.id, { onSettled: () => setCancelId(null) })
                    }
                  >
                    {isCancelling ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : null}
                    Cancel invite
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-[var(--ink-mute)] hover:text-[#DC2626]"
                  title="Cancel invitation"
                  onClick={() => setCancelId(inv.id)}
                >
                  <X className="size-4" />
                </Button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Member detail sheet ───────────────────────────────────────────────────────
function MemberDetailSheet({
  member,
  roles,
  open,
  onOpenChange,
}: {
  member: MemberItem | null;
  roles: RoleItem[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { can } = usePermissions();
  const { mutate: changeRole, isPending: isChangingRole } =
    useChangeMemberRole();

  const [display, setDisplay] = useState<MemberItem | null>(member);
  const [roleId, setRoleId] = useState<string>(member?.roleId ?? "");
  useEffect(() => {
    if (member) {
      setDisplay(member);
      setRoleId(member.roleId);
    }
  }, [member]);

  const role = roles.find((r) => r.id === roleId);
  const roleName = role?.name ?? display?.roleName ?? "";
  const grantedPerms = useMemo(() => {
    const granted = new Set(role?.permissions ?? []);
    return ALL_PERMISSIONS.filter((p) => granted.has(p.key));
  }, [role]);

  const isOwner = display?.roleName === "OWNER";
  const canEditRole = can("members:role_change") && !isOwner;
  const assignable = roles.filter((r) => r.name !== "OWNER");

  const handleRoleChange = (next: string) => {
    if (!display || next === roleId) return;
    setRoleId(next);
    changeRole({ membershipId: display.membershipId, roleId: next });
  };

  const name = display
    ? [display.firstName, display.lastName].filter(Boolean).join(" ") ||
      display.email
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        {display && (
          <>
            <SheetHeader className="px-5 py-4 border-b border-[var(--line)]">
              <SheetTitle className="flex items-center gap-3">
                <CRMAvatar name={name} size={40} />
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold truncate">
                    {name}
                  </div>
                  <RoleBadge name={roleName} />
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Member details
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Mail size={15} className="text-[var(--ink-mute)]" />
                  <span className="text-[var(--ink-soft)]">
                    {display.email}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px]">
                  <CalendarDays size={15} className="text-[var(--ink-mute)]" />
                  <span className="text-[var(--ink-soft)]">
                    Joined {new Date(display.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--ink-mute)] mb-2">
                  Role
                </div>
                {isOwner ? (
                  <div className="text-[12.5px] text-[var(--ink-mute)]">
                    The workspace owner&apos;s role can&apos;t be changed.
                  </div>
                ) : (
                  <Select
                    value={roleId}
                    onValueChange={handleRoleChange}
                    disabled={!canEditRole || isChangingRole}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignable.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-1.5 rounded-full bg-current",
                                ROLE_META[r.name]?.color ??
                                  "text-[var(--ink-mute)]",
                              )}
                            />
                            <span className="capitalize">
                              {r.name.toLocaleLowerCase()}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--ink-mute)] mb-2">
                  {roleName} permissions ({grantedPerms.length})
                </div>
                {grantedPerms.length === 0 ? (
                  <div className="text-[12.5px] text-[var(--ink-mute)]">
                    No permissions granted.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12.5px] text-[var(--ink-soft)]">
                    {grantedPerms.map((p) => (
                      <div key={p.key} className="flex items-center gap-1.5">
                        <Check
                          size={12}
                          className="text-[#15803D] flex-shrink-0"
                        />{" "}
                        {p.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Members Tab ───────────────────────────────────────────────────────────────
function MembersTab() {
  const { can } = usePermissions();
  const { data: members = [], isLoading } = useMembers();
  const { data: roles = [] } = useRoles();
  const { mutate: removeM, isPending: isRemoving } = useRemoveMember();
  const { mutate: changeRole, isPending: isChangingRole } =
    useChangeMemberRole();

  const canInvite = can("members:invite");
  const canRemove = can("members:remove");
  const canChangeRole = can("members:role_change");

  const [showInvite, setShowInvite] = useState(false);
  const [detailMember, setDetailMember] = useState<MemberItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MemberItem | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const memberName = (m: MemberItem) =>
    [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email;

  const byRole = useMemo(() => {
    return members.reduce(
      (acc, m) => {
        acc[m.roleName] = (acc[m.roleName] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.roleName !== roleFilter) return false;
      if (q && !`${memberName(m)} ${m.email}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [members, search, roleFilter]);

  const exportRows = (rows: MemberItem[]) => {
    const csv = [
      ["Name", "Email", "Role", "Joined"],
      ...rows.map((m) => [
        memberName(m),
        m.email,
        m.roleName,
        new Date(m.joinedAt).toISOString().slice(0, 10),
      ]),
    ]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-members.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<ColumnDef<MemberItem, unknown>[]>(
    () => [
      {
        id: "member",
        header: "Member",
        accessorFn: (m) => memberName(m),
        cell: ({ row }) => {
          const name = memberName(row.original);
          return (
            <div className="flex items-center gap-2.5">
              <CRMAvatar name={name} size={28} />
              <span className="font-medium">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-[var(--ink-mute)]">{row.original.email}</span>
        ),
      },
      {
        id: "role",
        header: "Role",
        enableSorting: false,
        accessorFn: (m) => m.roleName,
        cell: ({ row }) => {
          const m = row.original;
          if (m.roleName === "OWNER" || !canChangeRole)
            return <RoleBadge name={m.roleName} />;
          return (
            <span onClick={(e) => e.stopPropagation()}>
            <RoleSelector
              value={m.roleId}
              roles={roles}
              disabled={isChangingRole}
              onChange={(roleId) =>
                changeRole({ membershipId: m.membershipId, roleId })
              }
            />
            </span>
          );
        },
      },
      {
        id: "joined",
        header: "Joined",
        accessorFn: (m) => new Date(m.joinedAt).getTime(),
        cell: ({ row }) => (
          <span className="text-[var(--ink-mute)] text-[12px]">
            {new Date(row.original.joinedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 56,
        enableSorting: false,
        cell: ({ row }) => {
          const m = row.original;
          if (m.roleName === "OWNER" || !canRemove) return null;
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-[var(--ink-mute)] hover:text-[#DC2626]"
                title="Remove member"
                disabled={isRemoving}
                onClick={(e) => {
                  e.stopPropagation();
                  setRemoveTarget(m);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      roles,
      canChangeRole,
      canRemove,
      isChangingRole,
      isRemoving,
      changeRole,
    ],
  );

  const toolbar = (
    <>
      <div className="relative min-w-[200px] flex-[1_1_240px]">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
        />
        <Input
          className="pl-9"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="seg">
        <button
          className={roleFilter === "all" ? "on" : ""}
          onClick={() => setRoleFilter("all")}
        >
          All roles
        </button>
        {ROLE_ORDER.map((r) => (
          <button
            key={r}
            className={roleFilter === r ? "on" : ""}
            onClick={() => setRoleFilter(r)}
          >
            {r}
          </button>
        ))}
      </div>
      {canInvite && (
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="size-3.5" /> Invite member
        </Button>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-mute)]">
            Total
          </div>
          <div className="text-[28px] font-semibold mt-1 font-[var(--font-head)]">
            {members.length}
          </div>
          <div className="text-[11.5px] text-[var(--ink-mute)] mt-1">
            All members
          </div>
        </div>
        {ROLE_ORDER.map((r) => {
          const m = ROLE_META[r];
          return (
            <button
              key={r}
              onClick={() => setRoleFilter((cur) => (cur === r ? "all" : r))}
              className={cn(
                "card p-4 text-left transition-colors hover:bg-[var(--surface-2)]",
                roleFilter === r && "ring-1 ring-[var(--accent)]",
              )}
            >
              <div
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  m.color,
                )}
              >
                {r}
              </div>
              <div className="text-[28px] font-semibold mt-1 font-[var(--font-head)]">
                {byRole[r] ?? 0}
              </div>
              <div className="text-[11.5px] text-[var(--ink-mute)] mt-1 leading-snug">
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pending invitations */}
      <PendingInvites canInvite={canInvite} />

      {/* Members data table */}
      <DataTable
        data={filtered}
        columns={columns}
        toolbar={toolbar}
        onExport={exportRows}
        onRowClick={(m) => setDetailMember(m)}
        isLoading={isLoading}
        emptyMessage={
          members.length === 0
            ? "No members yet. Invite your first teammate!"
            : "No matching members."
        }
        defaultPageSize={10}
      />

      <InviteMemberDialog
        key={showInvite ? "invite-open" : "invite-closed"}
        open={showInvite}
        onClose={() => setShowInvite(false)}
        roles={roles}
      />

      <MemberDetailSheet
        member={detailMember}
        roles={roles}
        open={!!detailMember}
        onOpenChange={(v) => !v && setDetailMember(null)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) removeM(removeTarget.membershipId);
          setRemoveTarget(null);
        }}
        title="Remove member"
        description={
          removeTarget
            ? `Remove ${memberName(removeTarget)} from the workspace? They'll lose access immediately.`
            : undefined
        }
        confirmLabel="Remove"
        loading={isRemoving}
      />
    </div>
  );
}

// ── Per-role permission Sheet ─────────────────────────────────────────────────
function RolePermissionsSheet({
  role,
  open,
  onOpenChange,
}: {
  role: RoleItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate: savePerms, isPending: isSaving } = useUpdateRolePermissions();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Keep the last role visible through the close animation (avoids the "jerk"
  // caused by unmounting content the instant the sheet starts closing).
  const [displayRole, setDisplayRole] = useState<RoleItem | null>(role);

  useEffect(() => {
    if (role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayRole(role);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(new Set(role.permissions));
    }
  }, [role]);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleGroup = (keys: string[], allOn: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });

  const handleSave = () => {
    if (!displayRole) return;
    savePerms(
      { roleId: displayRole.id, permissions: Array.from(selected) },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0 duration-300">
        {displayRole && (
          <>
            <SheetHeader className="px-5 py-4 border-b border-[var(--line)] space-y-1">
              <SheetTitle className="flex items-center gap-2">
                <RoleBadge name={displayRole.name} /> permissions
              </SheetTitle>
              <SheetDescription>
                {ROLE_META[displayRole.name]?.desc ??
                  "Configure what this role can access."}{" "}
                · {selected.size} of {ALL_PERMISSION_KEYS.length} granted
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col divide-y divide-[var(--line-soft)]">
              {PERMISSION_GROUPS.map((group) => {
                const keys = group.perms.map((p) => p.key);
                const allOn = keys.every((k) => selected.has(k));
                return (
                  <div key={group.group} className="py-2.5 first:pt-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--ink-mute)]">
                        {group.group}
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        size="xs"
                        className="h-auto p-0 text-[10.5px]"
                        onClick={() => toggleGroup(keys, allOn)}
                      >
                        {allOn ? "Clear all" : "Select all"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      {group.perms.map((p) => {
                        const checked = selected.has(p.key);
                        return (
                          <label
                            key={p.key}
                            className="flex items-center gap-2.5 py-1 px-1.5 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggle(p.key)}
                            />
                            <span className="text-[var(--ink-soft)]">
                              {p.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <SheetFooter className="px-5 py-3.5 border-t border-[var(--line)] flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save permissions
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Roles & Permissions Tab ───────────────────────────────────────────────────
function PermissionsTab() {
  const { can } = usePermissions();
  const { data: roles = [], isLoading } = useRoles();
  const canEdit = can("roles:edit");

  const [editing, setEditing] = useState<RoleItem | null>(null);

  const sorted = useMemo(
    () =>
      [...roles].sort(
        (a, b) =>
          ROLE_ORDER.indexOf(a.name as never) -
          ROLE_ORDER.indexOf(b.name as never),
      ),
    [roles],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Info banner */}
      <div className="flex items-start gap-2.5 rounded-[12px] bg-[rgba(99,102,241,0.07)] border border-[rgba(99,102,241,0.18)] px-4 py-3">
        <Info size={14} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
        <p className="text-[12.5px] text-[var(--ink-soft)] leading-relaxed">
          The <strong>Owner</strong> role always has full access and cannot be
          modified. Edits to other roles take effect immediately.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((role) => {
          const m = ROLE_META[role.name];
          const isOwnerRole = role.name === "OWNER";
          return (
            <div key={role.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <RoleBadge name={role.name} />
                  <p className="text-[12px] text-[var(--ink-mute)] mt-2 leading-snug">
                    {m?.desc}
                  </p>
                </div>
                <Shield size={18} className={cn("opacity-40", m?.color)} />
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--line)]">
                <span className="text-[12px] text-[var(--ink-soft)]">
                  {isOwnerRole
                    ? "Full access"
                    : `${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}`}
                </span>
                {canEdit && !isOwnerRole && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(role)}
                  >
                    <Pencil className="size-3" /> Edit permissions
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RolePermissionsSheet
        role={editing}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
      />
    </div>
  );
}

// ── TeamSection (exported) ────────────────────────────────────────────────────
type TeamTab = "members" | "permissions";

export function TeamSection() {
  const { can } = usePermissions();
  const canViewRoles = can("roles:view");
  const [tab, setTab] = useState<TeamTab>("members");

  const tabs = (
    [
      { id: "members", label: "Members", icon: Users },
      { id: "permissions", label: "Roles & Permissions", icon: Shield },
    ] as const
  ).filter((t) => t.id !== "permissions" || canViewRoles);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold flex items-center gap-2">
            <ShieldCheck size={20} className="text-[var(--accent)]" />
            Access Control
          </h2>
          <p className="text-[12.5px] text-[var(--ink-mute)] mt-0.5">
            Manage your team members and configure role permissions.
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-[12px] bg-[var(--surface-2)] w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150",
              tab === id
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm"
                : "text-[var(--ink-mute)] hover:text-[var(--ink)]",
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "members" || !canViewRoles ? <MembersTab /> : <PermissionsTab />}
    </div>
  );
}
