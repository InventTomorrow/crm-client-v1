import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface NavigateIconProps {
  href?: string;
  label: string;
  className?: string;
  onNavigate?: () => void;
}

const iconClassName =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-mute)] transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] hover:border-[var(--accent)] hover:text-[var(--accent)]";

// Without href it's a visual cue inside a parent link — avoids nested <a>.
export function NavigateIcon({
  href,
  label,
  className,
  onNavigate,
}: NavigateIconProps) {
  if (!href) {
    return (
      <span aria-hidden className={cn(iconClassName, className)}>
        <ArrowUpRight size={13} />
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      onClick={onNavigate}
      className={cn(iconClassName, "no-underline", className)}
    >
      <ArrowUpRight size={13} />
    </Link>
  );
}
