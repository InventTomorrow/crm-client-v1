"use client";
import { Skeleton } from "@/shared/ui/Motion";
import { PlayCircle } from "lucide-react";
import { useState } from "react";
import ReactPlayer from "react-player";
import { DEMO_VIDEO_SRC } from "../constants";

/**
 * Renders the walkthrough video when a source is configured, otherwise a
 * branded placeholder so the layout is complete before the video is supplied.
 * Shared between the sidebar /demo page, the welcome dialog, and the landing
 * page's watch-demo modal.
 */
export function DemoPlayer({
  className,
  autoPlay = false,
}: {
  className?: string;
  autoPlay?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)] ${className ?? ""}`}
    >
      {DEMO_VIDEO_SRC ? (
        <>
          {!loaded && (
            <div className="absolute inset-0">
              <Skeleton className="h-full w-full rounded-none" />
              <PlayCircle
                size={44}
                strokeWidth={1.5}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--ink-mute)] opacity-50"
              />
            </div>
          )}
          <ReactPlayer
            src={DEMO_VIDEO_SRC}
            controls
            playsInline
            playing={autoPlay}
            muted={autoPlay}
            preload="auto"
            onReady={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            style={{ width: "100%", height: "100%" }}
            className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
          <PlayCircle
            size={48}
            className="text-[var(--accent)]"
            strokeWidth={1.5}
          />
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
