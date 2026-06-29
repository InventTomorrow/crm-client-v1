'use client';
/**
 * Motion.tsx — Reusable Framer Motion animation primitives.
 * Import these instead of using `motion.*` directly so animations
 * stay consistent and easy to tweak in one place.
 */
import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';

// ─── Variants ────────────────────────────────────────────────────────────────

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.14, ease: 'easeIn' } },
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.13, ease: 'easeIn' } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.14, ease: 'easeIn' } },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.14 } },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.14 } },
};

/** Stagger container — animates children one by one */
export const staggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

/** Individual child item for stagger lists */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ─── Component Wrappers ──────────────────────────────────────────────────────

type DivProps = HTMLMotionProps<'div'>;

/** Simple fade in/out */
export function FadeIn({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Fade + slide up */
export function FadeUp({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeUpVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Fade + scale in */
export function ScaleIn({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleInVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Staggered list container */
export function StaggerList({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Individual item inside StaggerList */
export function StaggerItem({ children, className, ...props }: DivProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// ─── Skeleton Shimmer ─────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  circle?: boolean;
  style?: React.CSSProperties;
}

/** Animated shimmer skeleton block */
export function Skeleton({ className = '', circle = false, style }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--line)] ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', repeatDelay: 0.3 }}
        style={{ translateX: '-100%' }}
      />
    </div>
  );
}

// ─── Page-level loading overlay ───────────────────────────────────────────────

/** Full-screen or container-level spinner overlay with backdrop */
export function LoadingOverlay({ label = 'Loading…' }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[var(--surface)]/70 backdrop-blur-[2px]"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]"
      />
      <span className="text-[12.5px] text-[var(--ink-mute)] font-medium">{label}</span>
    </motion.div>
  );
}

/** Inline small spinner — drop-in replacement for Loader2 */
export function Spinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      style={{ width: size, height: size }}
      className={`rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] flex-shrink-0 ${className}`}
    />
  );
}
