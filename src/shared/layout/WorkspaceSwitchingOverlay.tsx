'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/appStore';

/**
 * WorkspaceSwitchingOverlay
 * Premium glassmorphism full-screen loader shown while switching workspace context.
 * Shown via appStore.isSwitchingWorkspace.
 */
export function WorkspaceSwitchingOverlay() {
  const { isSwitchingWorkspace, switchingToWorkspaceName } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [dots, setDots] = useState('');

  // Manage entrance / exit animation
  useEffect(() => {
    if (isSwitchingWorkspace) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    } else {
      // Fade out then unmount
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [isSwitchingWorkspace]);

  // Animated ellipsis
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setDots(d => (d.length >= 3 ? '' : d + '.')), 420);
    return () => clearInterval(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(9, 9, 18, 0.65)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        opacity: isSwitchingWorkspace ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          padding: '40px 56px',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          transform: isSwitchingWorkspace ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          minWidth: 320,
          textAlign: 'center',
        }}
      >
        {/* Animated logo/spinner */}
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          {/* Outer ring */}
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            style={{ position: 'absolute', inset: 0, animation: 'ws-spin 1.6s linear infinite' }}
          >
            <circle
              cx="36" cy="36" r="30"
              fill="none"
              stroke="url(#ws-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="120 60"
            />
            <defs>
              <linearGradient id="ws-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#4FC3F7" />
              </linearGradient>
            </defs>
          </svg>
          {/* Inner dot */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #4FC3F7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(124,58,237,0.6)',
              animation: 'ws-pulse 1.6s ease-in-out infinite',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M12 3v18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <div style={{
            fontSize: 17,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
            fontFamily: 'var(--font-sans, system-ui)',
          }}>
            Switching workspace{dots}
          </div>
          {switchingToWorkspaceName && (
            <div style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-sans, system-ui)',
            }}>
              Loading{' '}
              <span style={{ color: '#C4B5FD', fontWeight: 600 }}>
                {switchingToWorkspaceName}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{
          width: 180,
          height: 3,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, #7C3AED, #4FC3F7)',
            animation: 'ws-progress 1.8s ease-in-out infinite',
          }} />
        </div>

        {/* Hint */}
        <div style={{
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'var(--font-sans, system-ui)',
        }}>
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
          50%       { transform: scale(0.85); opacity: 0.7; }
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
