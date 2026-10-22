"use client";
import { cn } from "@/lib/utils";
import { Progress } from "@/shared/ui/Progress";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const SEEDING_CEILING_PERCENT = 92;

interface SeedingProgressProps {
  count: number;
  progress: number;
}

export function SeedingProgress({ count, progress }: SeedingProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <Progress value={progress} className="h-1.5" />
      <ul className="flex flex-wrap gap-1.5">
        {Array.from({ length: count }, (_, index) => {
          const isCreated = progress >= ((index + 1) / count) * SEEDING_CEILING_PERCENT;
          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-[11px] font-medium transition-colors",
                isCreated
                  ? "border-transparent bg-[var(--success-soft)] text-[var(--success-foreground)]"
                  : "border-[var(--line)] text-[var(--ink-mute)]",
              )}
            >
              {isCreated ? <Check size={13} /> : index + 1}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
