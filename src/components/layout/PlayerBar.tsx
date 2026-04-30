import { useState, useEffect } from "react";
import {
  FastForward,
  ImageIcon,
  Pause,
  Play,
  Repeat,
  Rewind,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlaybackStore } from "@/stores/playbackStore";

const ScrollingText = ({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) => {
  return (
    <div className={`group overflow-hidden whitespace-nowrap ${className}`}>
      <span className="inline-block animate-[marquee_9s_linear_infinite] group-hover:animate-none">
        {children}
      </span>
    </div>
  );
};

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const PlayerBar = () => {
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [volume, setVolume] = useState(70);
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    setTime,
  } = usePlaybackStore();

  const isMuted = volume === 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay]);

  return (
    <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
      {/* LEFT */}
      <section className="flex min-w-0 items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-md border bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <ScrollingText className="max-w-[200px] text-sm font-medium">
            {currentTrack?.title ?? "No track selected"}
          </ScrollingText>

          <ScrollingText className="max-w-[200px] text-xs text-muted-foreground">
            {currentTrack?.artist ?? "—"}
          </ScrollingText>
        </div>
      </section>

      {/* CENTER */}
      <section className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShuffleEnabled((c) => !c)}
            className={shuffleEnabled ? "text-blue-500" : ""}
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon">
            <Rewind className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>

          <Button variant="ghost" size="icon">
            <FastForward className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRepeatEnabled((c) => !c)}
            className={repeatEnabled ? "text-blue-500" : ""}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex w-72 items-center gap-2 text-xs text-muted-foreground">
          <div className="flex w-72 items-center gap-2 text-xs text-muted-foreground">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>

            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full"
            />

            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="flex justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(isMuted ? 70 : 0)}
            className={isMuted ? "text-red-500" : ""}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </section>
    </div>
  );
};
