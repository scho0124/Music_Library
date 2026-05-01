import { useState } from "react";
import {
  FastForward,
  Rewind,
  Play,
  Pause,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlaybackStore } from "@/stores/playbackStore";

// -----------------------------
// Scrolling text
// -----------------------------
const ScrollingText = ({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) => {
  return (
    <div className={`group overflow-hidden whitespace-nowrap ${className}`}>
      <span className="inline-block animate-[marquee_10s_linear_infinite] group-hover:animate-none">
        {children}
      </span>
    </div>
  );
};

export const PlayerBar = () => {
  const [volume, setVolume] = useState(70);

  const {
    currentTrack,
    isPlaying,
    togglePlay,
    next,
    prev,
    currentTime,
    duration,
    setTime,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
  } = usePlaybackStore();

  const isMuted = volume === 0;

  const formatTime = (v: number) => {
    const m = Math.floor(v / 60);
    const s = Math.floor(v % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const activeBtn =
    "text-blue-500 bg-blue-500/10 hover:text-blue-500 hover:bg-blue-500/10";

  const normalBtn =
    "text-muted-foreground hover:text-foreground hover:bg-muted";

  return (
    <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
      {/* LEFT */}
      <section className="flex min-w-0 items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border bg-muted overflow-hidden">
          {currentTrack?.artwork ? (
            <img
              src={currentTrack.artwork}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0">
          <ScrollingText className="max-w-[200px] text-sm font-medium">
            {currentTrack?.title || "No track selected"}
          </ScrollingText>

          <ScrollingText className="max-w-[200px] text-xs text-muted-foreground">
            {currentTrack?.artist || ""}
          </ScrollingText>
        </div>
      </section>

      {/* CENTER */}
      <section className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          {/* Shuffle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={shuffle ? activeBtn : normalBtn}
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          {/* Prev */}
          <Button variant="ghost" size="icon" onClick={prev}>
            <Rewind className="h-5 w-5" />
          </Button>

          {/* Play */}
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

          {/* Next */}
          <Button variant="ghost" size="icon" onClick={next}>
            <FastForward className="h-5 w-5" />
          </Button>

          {/* Repeat */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={repeat ? activeBtn : normalBtn}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="flex w-64 items-center gap-2 text-xs text-muted-foreground md:w-96">
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
