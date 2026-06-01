'use client';
import { useRouter } from 'next/navigation';
import { User, Settings, Shield, Bell, Sun, Moon, Link, Cloud, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/appStore';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { useMe, useLogout } from '@/features/auth/hooks/useAuth';

function ProfRow({ icon: Icon, label, sub, onClick, danger }: { icon: React.ElementType; label: string; sub?: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full px-[10px] py-2 border-none rounded-lg text-[13px] text-left cursor-pointer font-[inherit] transition-colors',
        'hover:bg-[var(--surface-2)]',
        danger ? 'text-[#DC2626] hover:bg-[rgba(239,68,68,0.06)]' : 'text-[var(--ink-soft)]',
      )}
    >
      <Icon size={14} className={danger ? 'text-[#DC2626]' : 'text-[var(--ink-mute)]'} />
      <span className="flex-1">{label}</span>
      {sub && <span className="text-[11px] text-[var(--ink-mute)] font-[var(--font-mono)]">{sub}</span>}
    </button>
  );
}

interface ProfileMenuProps { onClose: () => void; }

export function ProfileMenu({ onClose }: ProfileMenuProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useAppStore();
  const { user } = useMe();
  const logout = useLogout();

  const profileName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '';
  const profileEmail = user?.email || '';

  const go = (path: string) => { router.push(path); onClose(); };

  return (
    <div className="card-2 fade-up w-[260px] bg-[var(--surface)] overflow-hidden">
      <div className="px-[14px] py-[14px] border-b border-[var(--line)] flex items-center gap-3">
        <CRMAvatar name={profileName} size={40} />
        <div className="min-w-0">
          <div className="font-medium text-[13.5px]">{profileName}</div>
          <div className="text-[11.5px] text-[var(--ink-mute)] truncate">{profileEmail}</div>
          {user?.memberships?.[0] && (
            <span className="badge bg-[var(--accent-soft)] text-[var(--accent)] font-medium mt-1 inline-flex">
              {user.memberships[0].role.name}
            </span>
          )}
        </div>
      </div>
      <div className="p-1.5">
        <ProfRow icon={User}     label="Profile"            onClick={() => go('/settings')} />
        <ProfRow icon={Settings} label="Workspace settings" onClick={() => go('/settings')} />
        <ProfRow icon={Shield}   label="Team & Access"      onClick={() => go('/admin')} />
        <ProfRow icon={Bell}     label="Notifications"      onClick={() => go('/settings')} />
      </div>
      <div className="h-px bg-[var(--line)]" />
      <div className="p-1.5">
        <ProfRow icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={() => { toggleTheme(); }} />
        <ProfRow icon={Link}  label="Keyboard shortcuts" sub="⌘K · ?" />
        <ProfRow icon={Cloud} label="Documentation" />
      </div>
      <div className="h-px bg-[var(--line)]" />
      <div className="p-1.5">
        <ProfRow icon={Lock} label="Sign out" danger onClick={() => logout.mutate()} />
      </div>
    </div>
  );
}
