import Image from "next/image";

/**
 * Full-screen branded loading state: the AsaanRabta logo above a slim
 * progress track with a continuous shimmer sweep. Used by the App Router
 * root `loading.tsx` and reusable anywhere a full-page fallback is needed.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-[var(--bg)]">
      <Image
        src="/asaanrabta-logo.png"
        alt="AsaanRabta"
        width={895}
        height={290}
        priority
        className="h-14 w-auto animate-pulse"
      />
      <div className="relative h-1.5 w-56 overflow-hidden rounded-full bg-brand-mint-2">
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-brand-green to-transparent animate-[shimmerWave_1.4s_linear_infinite]" />
      </div>
    </div>
  );
}
