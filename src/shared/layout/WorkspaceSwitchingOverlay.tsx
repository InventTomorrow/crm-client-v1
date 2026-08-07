'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/appStore';

/**
 * WorkspaceSwitchingOverlay
 * Branded full-screen loader shown while switching workspace context — the
 * AsaanRabta mark over a shimmer track, no panel or card. Driven by
 * appStore.isSwitchingWorkspace and built from design tokens so it adapts to
 * light/dark automatically.
 */
export function WorkspaceSwitchingOverlay() {
  const { isSwitchingWorkspace, switchingToWorkspaceName } = useAppStore();
  const [visible, setVisible] = useState(false);

  // Keep mounted through the fade-out, then unmount.
  useEffect(() => {
    if (isSwitchingWorkspace) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const fadeOutTimer = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(fadeOutTimer);
  }, [isSwitchingWorkspace]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[var(--bg)]/50 backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-400 ease-out"
      style={{ opacity: isSwitchingWorkspace ? 1 : 0 }}
    >
      {/* Logo — soft accent glow breathing behind the mark */}
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: isSwitchingWorkspace ? 'translateY(0)' : 'translateY(6px)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <span
          aria-hidden
          className="absolute h-20 w-20 rounded-full blur-2xl"
          style={{
            background: 'var(--accent-soft)',
            animation: 'ws-glow 2.4s ease-in-out infinite',
          }}
        />
        <Image
          src="/asaanrabta-logo.png"
          alt="AsaanRabta"
          width={895}
          height={290}
          priority
          className="relative h-11 w-auto"
          style={{ animation: 'ws-lift 2.4s ease-in-out infinite' }}
        />
      </div>

      {/* Shimmer track */}
      <div className="relative h-1.5 w-44 overflow-hidden rounded-full bg-[var(--line)] sm:w-56">
        <div
          className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
          style={{ animation: 'shimmerWave 1.4s linear infinite' }}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
          Switching workspace
        </p>
        {switchingToWorkspaceName && (
          <p className="text-[12.5px] text-[var(--ink-mute)]">
            Loading{' '}
            <span className="font-semibold text-[var(--accent)]">
              {switchingToWorkspaceName}
            </span>
          </p>
        )}
      </div>

      <style>{`
        @keyframes ws-lift {
          0%, 100% { transform: translateY(0);    opacity: 1; }
          50%      { transform: translateY(-4px); opacity: 0.82; }
        }
        @keyframes ws-glow {
          0%, 100% { transform: scale(1);    opacity: 0.55; }
          50%      { transform: scale(1.25); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
