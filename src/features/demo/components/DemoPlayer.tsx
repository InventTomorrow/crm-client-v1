"use client";
import { PlayCircle } from "lucide-react";
import { DEMO_VIDEO_SRC } from "../constants";

/**
 * Renders the walkthrough video when a source is configured, otherwise a
 * branded placeholder so the layout is complete before the video is supplied.
 */
export function DemoPlayer({ className }: { className?: string }) {
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)] ${className ?? ""}`}
    >
      {DEMO_VIDEO_SRC ? (
        <video
          src={DEMO_VIDEO_SRC}
          controls
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
          <PlayCircle size={48} className="text-[var(--accent)]" strokeWidth={1.5} />
          <p className="text-[13px] font-medium text-[var(--ink-soft)]">
            Walkthrough video coming soon
          </p>
          <p className="text-[11.5px] text-[var(--ink-mute)]">
            A quick tour of the platform will play here.
          </p>
        </div>
      )}
    </div>
  );
}
