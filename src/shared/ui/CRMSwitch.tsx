'use client';

interface CRMSwitchProps {
  on: boolean;
  onChange: (v: boolean) => void;
  size?: 'sm' | 'md';
}

export function CRMSwitch({ on, onChange, size = 'sm' }: CRMSwitchProps) {
  const w = size === 'sm' ? 32 : 40;
  const h = size === 'sm' ? 18 : 22;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!on); }}
      style={{
        width: w,
        height: h,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: on ? 'var(--accent)' : 'var(--line)',
        position: 'relative',
        transition: 'background 200ms',
        padding: 2,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? w - h + 2 : 2,
          width: h - 4,
          height: h - 4,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          transition: 'left 180ms ease',
        }}
      />
    </button>
  );
}
