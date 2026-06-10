'use client';
import { gradientFor, initials } from '@/lib/utils';

interface CRMAvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  ring?: boolean;
}

/** Returns true when the string has no real letter characters (phone numbers, empty, etc.) */
function isNameless(name: string): boolean {
  return !name || name === '?' || !/[^\d\s+\-().]/u.test(name);
}

function DefaultSilhouette({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: '50%', flexShrink: 0, display: 'block' }}
    >
      <circle cx="50" cy="50" r="50" fill="#F0F2F5" />
      <circle cx="50" cy="37" r="18" fill="#B4B9BE" />
      <path d="M 7 92 C 7 64 93 64 93 92 Z" fill="#B4B9BE" />
    </svg>
  );
}

export function CRMAvatar({ name = '?', src, size = 40, ring = false }: CRMAvatarProps) {
  const showSilhouette = !src && isNameless(name);

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
  ) : showSilhouette ? (
    <DefaultSilhouette size={size} />
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
