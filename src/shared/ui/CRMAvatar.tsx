'use client';
import { gradientFor, initials } from '@/lib/utils';

interface CRMAvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  ring?: boolean;
}

export function CRMAvatar({ name = '?', src, size = 40, ring = false }: CRMAvatarProps) {
  const inner = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  ) : (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: gradientFor(name),
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );

  if (ring) {
    return (
      <div className="p-0.5 rounded-full bg-[linear-gradient(135deg,#4FC3F7,#7C3AED)] flex-shrink-0">
        <div className="p-0.5 rounded-full bg-[var(--bg,white)]">
          {inner}
        </div>
      </div>
    );
  }
  return inner;
}
