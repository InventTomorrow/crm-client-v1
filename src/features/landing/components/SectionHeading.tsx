import type { ReactNode } from "react";
import Reveal from "./Reveal";

type SectionHeadingProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  dark?: boolean;
  center?: boolean;
  className?: string;
};

export default function SectionHeading({
  title,
  subtitle,
  dark = false,
  center = true,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`${center ? "text-center mx-auto" : "text-left"} max-w-3xl ${className}`}
    >
      <Reveal
        as="h2"
        className={`text-[40px] md:text-5xl lg:text-[58px] font-bold leading-[1.05] tracking-tight ${dark ? "text-white" : "text-brand-dark"}`}
      >
        {title}
      </Reveal>
      {subtitle && (
        <Reveal delay={0.08}>
          <p
            className={`mt-5 text-base md:text-[17px] leading-relaxed ${dark ? "text-white/70" : "text-brand-text"} ${center ? "max-w-xl mx-auto" : ""}`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
