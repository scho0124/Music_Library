import { useState } from "react";
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

/**
 * ScrollingText
 *
 * Used for long song/artist names.
 * CSS handles the delay:
 * - wait 3 seconds
 * - scroll text
 * - repeat
 */

const ScrollingText = ({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) => {
  return (
    <div
      className={`group max-w-full overflow-hidden whitespace-nowrap ${className}`}
    >
      <span className="inline-block group-hover:animate-none animate-[marquee_9s_linear_infinite]">
        {children}
      </span>
    </div>
  );
};

export const PlayerBar = () => {
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);

  const isMuted = volume === 0;

  return (
    <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
      {/* Left: album art + current track info */}
      <section className="flex min-w-0 items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <ScrollingText className="max-w-[180px] text-sm font-medium md:max-w-[260px]">
            Song Title That Might Be Very Long And Needs To Scroll
          </ScrollingText>

          <ScrollingText className="max-w-[180px] text-xs text-muted-foreground md:max-w-[260px]">
            Artist Name That Might Also Be Very Long
          </ScrollingText>
        </div>
      </section>

      {/* Center: playback controls + progress */}
      <section
        aria-label="Playback controls"
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShuffleEnabled((current) => !current)}
            className={shuffleEnabled ? "text-blue-500" : ""}
            aria-pressed={shuffleEnabled}
            aria-label="Toggle shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Previous track">
            <Rewind className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setIsPlaying((current) => !current)}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>

          <Button variant="ghost" size="icon" aria-label="Next track">
            <FastForward className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRepeatEnabled((current) => !current)}
            className={repeatEnabled ? "text-blue-500" : ""}
            aria-pressed={repeatEnabled}
            aria-label="Toggle repeat"
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Track progress slider */}
        <div className="flex w-56 items-center gap-2 text-xs text-muted-foreground md:w-80">
          <span className="w-9 text-right">0:00</span>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
            className="w-full"
            aria-label="Track progress"
          />

          <span className="w-9">3:45</span>
        </div>
      </section>

      {/* Right: volume */}
      <section className="flex justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(isMuted ? 70 : 0)}
            className={isMuted ? "text-red-500" : ""}
            aria-pressed={isMuted}
            aria-label={isMuted ? "Unmute" : "Mute"}
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
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-20 md:w-28"
            aria-label="Volume"
          />
        </div>
      </section>
    </div>
  );
};
