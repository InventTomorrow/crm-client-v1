"use client";

import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "h2" | "h3" | "p" | "span" | "section";
};

/**
 * Scroll-triggered reveal. Wraps children in a motion element that fades + lifts in
 * the first time it enters the viewport. (No shadcn equivalent — shadcn's Motion
 * primitives animate on mount, not on scroll into view.)
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
  as = "div",
}: RevealProps) {
  const MotionTag = (motion[as] ?? motion.div) as ElementType;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
