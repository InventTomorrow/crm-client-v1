"use client";
import { useLogout, useMe } from "@/features/auth/hooks/useAuth";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { tourIdFor } from "@/features/tour/steps/workspaceSteps";
import { useAppStore } from "@/lib/appStore";
import { cn } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { Spinner } from "@/shared/ui/Motion";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Compass,
  Lock,
  Moon,
  PlayCircle,
  Settings,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useNextStep } from "nextstepjs";

function ProfRow({
  icon: Icon,
  label,
  sub,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2.5 w-full px-[10px] py-2 border-none rounded-lg text-[13px] text-left cursor-pointer font-[inherit] transition-colors",
        "hover:bg-[var(--surface-2)] disabled:opacity-60 disabled:cursor-not-allowed",
        danger
          ? "text-[#DC2626] hover:bg-[rgba(239,68,68,0.06)]"
          : "text-[var(--ink-soft)]",
      )}
    >
      <Icon
        size={14}
        className={danger ? "text-[#DC2626]" : "text-[var(--ink-mute)]"}
      />
      <span className="flex-1">{label}</span>
      {sub && (
        <span className="text-[11px] text-[var(--ink-mute)] font-[var(--font-mono)]">
          {sub}
        </span>
      )}
    </button>
  );
}

interface ProfileMenuProps {
  onClose: () => void;
}

export function ProfileMenu({ onClose }: ProfileMenuProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useAppStore();
  const { user } = useMe();
  const logout = useLogout();
  const { tenant } = useCurrentTenant();
  const { startNextStep } = useNextStep();
  const isLoggingOut = logout.isPending;
  const tourId = tourIdFor(tenant?.businessVertical);

  const profileName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "";
  const profileEmail = user?.email || "";

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

  // The guide opens on dashboard elements, so land there before it starts.
  const replayWorkspaceTour = () => {
    if (!tourId) return;
    router.push("/dashboard");
    onClose();
    setTimeout(() => startNextStep(tourId), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="card-2 w-[260px] bg-[var(--surface)] overflow-hidden relative"
    >
      {/* Logout loading overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-[var(--surface)]/80 backdrop-blur-[2px]"
          >
            <Spinner size={22} />
            <span className="text-[12px] text-[var(--ink-mute)] font-medium">
              Signing out…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-[14px] py-[14px] border-b border-[var(--line)] flex items-center gap-3">
        <CRMAvatar name={profileName} size={40} />
        <div className="min-w-0">
          <div className="font-medium text-[13.5px]">{profileName}</div>
          <div className="text-[11.5px] text-[var(--ink-mute)] truncate">
            {profileEmail}
          </div>
          {user?.memberships?.[0] && (
            <span className="badge bg-[var(--accent-soft)] text-[var(--accent)] font-medium mt-1 inline-flex">
              {user.memberships[0].role.name}
            </span>
          )}
        </div>
      </div>
      <div className="p-1.5">
        <ProfRow
          icon={User}
          label="Profile"
          onClick={() => go("/settings")}
          disabled={isLoggingOut}
        />
        <ProfRow
          icon={Settings}
          label="Workspace settings"
          onClick={() => go("/settings")}
          disabled={isLoggingOut}
        />
        <ProfRow
          icon={Shield}
          label="Team & Access"
          onClick={() => go("/admin")}
          disabled={isLoggingOut}
        />
        <ProfRow
          icon={Bell}
          label="Notifications"
          onClick={() => go("/settings")}
          disabled={isLoggingOut}
        />
      </div>
      <div className="h-px bg-[var(--line)]" />
      <div className="p-1.5">
        <ProfRow
          icon={theme === "dark" ? Sun : Moon}
          label={theme === "dark" ? "Light mode" : "Dark mode"}
          onClick={() => {
            toggleTheme();
          }}
          disabled={isLoggingOut}
        />
        {/* <ProfRow icon={Link}      label="Keyboard shortcuts" sub="⌘K · ?" disabled={isLoggingOut} /> */}
        <ProfRow
          icon={Compass}
          label="Take a tour"
          onClick={replayWorkspaceTour}
          disabled={isLoggingOut || !tourId}
        />
        <ProfRow
          icon={PlayCircle}
          label="Watch Demo"
          onClick={() => go("/demo")}
          disabled={isLoggingOut}
        />
      </div>
      <div className="h-px bg-[var(--line)]" />
      <div className="p-1.5">
        <ProfRow
          icon={isLoggingOut ? () => <Spinner size={14} /> : Lock}
          label="Sign out"
          danger
          disabled={isLoggingOut}
          onClick={() => logout.mutate()}
        />
      </div>
    </motion.div>
  );
}
