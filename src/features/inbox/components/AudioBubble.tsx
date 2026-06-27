"use client";
import { cn } from "@/lib/utils";
import { Mic, Pause, Play } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

// Static pseudo-waveform — deterministic bar heights for the WhatsApp look.
const WAVEFORM_BARS = [
  0.35, 0.55, 0.8, 0.45, 0.95, 0.6, 0.4, 0.7, 1, 0.5, 0.3, 0.65, 0.85, 0.45,
  0.55, 0.9, 0.4, 0.75, 0.6, 0.35, 0.8, 0.5, 0.7, 0.45, 0.6, 0.9, 0.4, 0.55,
];

/** WhatsApp-style voice note player: play/pause, seekable waveform, timer, mic. */
function AudioBubbleBase({ url, outbound }: { url: string; outbound: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const probingRef = useRef(false); // true while forcing duration calc
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const knownDuration = Number.isFinite(duration) && duration > 0;
  const pct = knownDuration ? Math.min((progress / duration) * 100, 100) : 0;

  // .ogg/opus and .webm recordings often lack a duration header, so the browser
  // reports Infinity. Seeking to a huge time forces it to scan and compute the
  // real duration, which then arrives via `durationchange`; we reset to 0 after.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const resolveDuration = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) {
        setDuration(a.duration);
        if (probingRef.current) {
          probingRef.current = false;
          a.currentTime = 0;
        }
      } else if (!probingRef.current) {
        probingRef.current = true;
        try {
          a.currentTime = 1e101;
        } catch {
          /* seeking unsupported */
        }
      }
    };

    a.addEventListener("loadedmetadata", resolveDuration);
    a.addEventListener("durationchange", resolveDuration);
    if (a.readyState >= 1) resolveDuration(); // metadata already available

    return () => {
      a.removeEventListener("loadedmetadata", resolveDuration);
      a.removeEventListener("durationchange", resolveDuration);
    };
  }, [url]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try {
        await a.play();
      } catch {
        /* autoplay/decoding guard */
      }
    } else {
      a.pause();
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !knownDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    a.currentTime = ratio * duration;
    setProgress(a.currentTime);
  };

  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const filledColor = outbound ? "bg-white" : "bg-[var(--accent)]";
  const trackColor = outbound ? "bg-white/35" : "bg-[var(--ink-mute)]/30";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[16px] px-3 py-2.5 min-w-[230px] max-w-[280px]",
        outbound
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)]",
      )}
    >
      {/* Play / pause */}
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-transform active:scale-95",
          outbound
            ? "bg-white text-[var(--accent)]"
            : "bg-[var(--accent)] text-white",
        )}
      >
        {playing ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      {/* Waveform + timer */}
      <div className="flex-1 min-w-0">
        <div
          onClick={seek}
          className={cn(
            "flex items-center gap-[2px] h-7",
            knownDuration && "cursor-pointer",
          )}
        >
          {WAVEFORM_BARS.map((h, i) => {
            const barPct = ((i + 1) / WAVEFORM_BARS.length) * 100;
            const filled = barPct <= pct;
            return (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  filled ? filledColor : trackColor,
                )}
                style={{ height: `${Math.max(h * 100, 18)}%` }}
              />
            );
          })}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-[10.5px]",
            outbound ? "text-white/85" : "text-[var(--ink-mute)]",
          )}
        >
          <Mic
            size={11}
            className={outbound ? "text-white/85" : "text-[var(--accent)]"}
          />
          <span>{fmt(playing || progress > 0 ? progress : duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={(e) => {
          if (!probingRef.current) setProgress(e.currentTarget.currentTime);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
      />
    </div>
  );
}

export const AudioBubble = memo(AudioBubbleBase);
