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
    next,
    prev,
    currentTime,
    duration,
    setTime,
  } = usePlaybackStore();

  const isMuted = volume === 0;

  // Spacebar toggle
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay]);

  return (
    <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-md border flex items-center justify-center">
          <ImageIcon />
        </div>

        <div>
          <p>{currentTrack?.title ?? "No track selected"}</p>
          <p className="text-xs text-muted-foreground">
            {currentTrack?.artist ?? ""}
          </p>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Shuffle />
          </Button>

          <Button size="icon" variant="ghost" onClick={prev}>
            <Rewind />
          </Button>

          <Button size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause /> : <Play />}
          </Button>

          <Button size="icon" variant="ghost" onClick={next}>
            <FastForward />
          </Button>

          <Button size="icon" variant="ghost">
            <Repeat />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-72">
          <span className="text-xs">{formatTime(currentTime)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => setTime(Number(e.target.value))}
            className="w-full"
          />

          <span className="text-xs">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex justify-end items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setVolume(isMuted ? 70 : 0)}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
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
    </div>
  );
};
