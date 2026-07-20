'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/appStore';

/**
 * WorkspaceSwitchingOverlay
 * Theme-aware full-screen loader shown while switching workspace context.
 * Driven by appStore.isSwitchingWorkspace. Uses design tokens so it adapts
 * to light/dark automatically.
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
    const t = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(t);
  }, [isSwitchingWorkspace]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--ink)]/55 backdrop-blur-xl transition-opacity duration-400 ease-out"
      style={{ opacity: isSwitchingWorkspace ? 1 : 0 }}
    >
      <div
        className="glass-effect flex flex-col items-center gap-7 rounded-3xl border border-[var(--line)] bg-[var(--surface)]/80 px-14 py-10 text-center shadow-2xl min-w-[320px]"
        style={{
          transform: isSwitchingWorkspace
            ? 'scale(1) translateY(0)'
            : 'scale(0.96) translateY(8px)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Spinner */}
        <div className="relative h-[72px] w-[72px]">
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            className="absolute inset-0"
            style={{ animation: 'ws-spin 1.6s linear infinite' }}
          >
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="120 60"
              opacity="0.9"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--bg)]"
              style={{
                background: 'var(--grad-v)',
                boxShadow: '0 0 24px var(--accent-soft)',
                animation: 'ws-pulse 1.6s ease-in-out infinite',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12h18M12 3v18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="text-[17px] font-bold tracking-tight text-[var(--ink)]">
            Switching workspace
          </div>

          {/* Blinking dots on their own line */}
          <div className="flex items-center gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                style={{ animation: `ws-blink 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>

          {switchingToWorkspaceName && (
            <div className="text-[13px] text-[var(--ink-mute)]">
              Loading{' '}
              <span className="font-semibold text-[var(--accent)]">
                {switchingToWorkspaceName}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-[3px] w-[180px] overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full"
            style={{ background: 'var(--grad-h)', animation: 'ws-progress 1.8s ease-in-out infinite' }}
          />
        </div>

        <div className="text-[11.5px] text-[var(--ink-mute)]">
          Syncing data for your workspace
        </div>
      </div>

      <style>{`
        @keyframes ws-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ws-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(0.85); opacity: 0.7; }
        }
        @keyframes ws-blink {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50%      { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes ws-progress {
          0%   { transform: translateX(-100%); width: 60%; }
          50%  { transform: translateX(60%);   width: 80%; }
          100% { transform: translateX(200%);  width: 60%; }
        }
      `}</style>
    </div>
  );
}
