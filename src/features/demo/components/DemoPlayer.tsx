"use client";
import { Skeleton } from "@/shared/ui/Motion";
import { Loader2, Play, PlayCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FULL_DEMO_VIDEO_ID, FULL_DEMO_VIDEO_TITLE } from "../constants";

const YOUTUBE_EMBED_BASE_URL = "https://www.youtube-nocookie.com/embed";
const PLAYER_LOAD_TIMEOUT_MS = 10_000;
const PLAY_BADGE_CLASS =
  "flex size-16 items-center justify-center rounded-full bg-brand-green text-white shadow-cta ring-4 ring-white/70 sm:size-20";

type PlayerStatus = "idle" | "loading" | "ready";

function getYouTubeEmbedSrc(videoId: string, isAutoPlay: boolean) {
  const params = new URLSearchParams({ rel: "0", playsinline: "1" });
  if (isAutoPlay) params.set("autoplay", "1");
  return `${YOUTUBE_EMBED_BASE_URL}/${videoId}?${params}`;
}

/** Shared by the sidebar /demo page, the welcome dialog, and the landing page's hero + watch-demo modal. */
export function DemoPlayer({
  className,
  videoId = FULL_DEMO_VIDEO_ID,
  title = FULL_DEMO_VIDEO_TITLE,
  thumbnailSrc,
  autoPlay = false,
}: {
  className?: string;
  videoId?: string;
  title?: string;
  thumbnailSrc?: string;
  autoPlay?: boolean;
}) {
  // With a thumbnail, YouTube's ~1MB player only loads on click instead of with the page.
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>(
    thumbnailSrc ? "idle" : "loading",
  );
  const embedSrc = getYouTubeEmbedSrc(videoId, autoPlay || Boolean(thumbnailSrc));

  useEffect(() => {
    if (!thumbnailSrc || playerStatus !== "loading") return;
    // Drop a stalled player and bring the play button back so the visitor can retry.
    const timeoutId = window.setTimeout(
      () => setPlayerStatus("idle"),
      PLAYER_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [thumbnailSrc, playerStatus]);

  const isReady = playerStatus === "ready";

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)] ${className ?? ""}`}
    >
      {!isReady && (
        <div className="absolute inset-0">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              preload
              sizes="(max-width: 940px) 100vw, 900px"
              className="object-cover"
            />
          ) : (
            <>
              <Skeleton className="h-full w-full rounded-none" />
              <PlayCircle
                size={44}
                strokeWidth={1.5}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--ink-mute)] opacity-50"
              />
            </>
          )}
        </div>
      )}
      {playerStatus !== "idle" && (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={() => setPlayerStatus("ready")}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {thumbnailSrc && playerStatus === "idle" && (
        <button
          type="button"
          onClick={() => setPlayerStatus("loading")}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex cursor-pointer items-center justify-center"
        >
          <span
            className={`${PLAY_BADGE_CLASS} transition-transform group-hover:scale-110 group-hover:bg-brand-green-hover`}
          >
            <Play className="size-7 translate-x-0.5 fill-current sm:size-8" />
          </span>
        </button>
      )}
      {thumbnailSrc && playerStatus === "loading" && (
        <div
          role="status"
          aria-label="Loading video"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className={PLAY_BADGE_CLASS}>
            <Loader2 className="size-7 animate-spin sm:size-8" />
          </span>
        </div>
      )}
    </div>
  );
}
