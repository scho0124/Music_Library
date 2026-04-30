import { useState } from "react";
import { Play, Pause } from "lucide-react";

import { usePlaybackStore } from "@/stores/playbackStore";
import { useLibraryStore } from "@/stores/libraryStore";

/**
 * Format seconds → mm:ss
 */
const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export const SongTable = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { songs } = useLibraryStore();
  const { currentTrack, isPlaying, setQueueAndPlay, togglePlay } =
    usePlaybackStore();

  return (
    <div className="h-full overflow-hidden rounded-md border">
      {/* Header */}
      <div className="grid grid-cols-[40px_2fr_1.5fr_1.5fr_80px] border-b bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
        <span>#</span>
        <span>Title</span>
        <span>Artist</span>
        <span>Album</span>
        <span className="text-right">Time</span>
      </div>

      {/* Rows */}
      <div className="h-full overflow-auto">
        {songs.map((song, index) => {
          const isSelected = selectedId === song.id;
          const isActive = currentTrack?.id === song.id;

          return (
            <div
              key={song.id}
              onClick={() => setSelectedId(song.id)}
              onDoubleClick={() => setQueueAndPlay(songs, index)}
              className={`
                group grid cursor-pointer grid-cols-[40px_2fr_1.5fr_1.5fr_80px] items-center px-3 py-2 text-sm
                ${isActive ? "bg-blue-500 text-white" : ""}
                ${!isActive && isSelected ? "bg-muted/70" : ""}
                ${!isActive ? "hover:bg-muted/60" : ""}
              `}
            >
              {/* LEFT COLUMN */}
              <span className="flex items-center justify-center">
                {isActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white" />
                    )}
                  </button>
                ) : (
                  <>
                    {/* number */}
                    <span className="text-muted-foreground group-hover:hidden">
                      {index + 1}
                    </span>

                    {/* hover play */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueueAndPlay(songs, index);
                      }}
                      className="hidden group-hover:block"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  </>
                )}
              </span>

              {/* Title */}
              <span className="truncate">{song.title}</span>

              {/* Artist */}
              <span
                className={`truncate ${
                  isActive ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {song.artist}
              </span>

              {/* Album */}
              <span
                className={`truncate ${
                  isActive ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {song.album}
              </span>

              {/* Duration */}
              <span
                className={`text-right ${
                  isActive ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {formatTime(song.duration)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
