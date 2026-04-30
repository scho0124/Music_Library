import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { usePlaybackStore } from "@/stores/playbackStore";

type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  src: string;
};

const mockSongs: Song[] = [
  {
    id: 1,
    title: "Test Song",
    artist: "Demo Artist",
    album: "Demo Album",
    duration: "3:45",
    src: "/audio/test.mp3",
  },
];
export const SongTable = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlaybackStore();

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
        {mockSongs.map((song, index) => {
          const isSelected = selectedId === song.id;
          const isActive = currentTrack?.id === song.id;

          return (
            <div
              key={song.id}
              onClick={() => setSelectedId(song.id)}
              onDoubleClick={() => setTrack(song)}
              className={`
                group
                grid cursor-pointer grid-cols-[40px_2fr_1.5fr_1.5fr_80px] items-center px-3 py-2 text-sm
                ${isActive ? "bg-blue-500 text-white" : ""}
                ${!isActive && isSelected ? "bg-muted/70" : ""}
                ${!isActive ? "hover:bg-muted/60" : ""}
              `}
            >
              {/* LEFT COLUMN */}
              <span className="flex items-center justify-center">
                {isActive ? (
                  // Active track → play/pause
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
                    {/* Default: number */}
                    <span className="text-muted-foreground group-hover:hidden">
                      {index + 1}
                    </span>

                    {/* Hover: play button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrack(song);
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
                {song.duration}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
