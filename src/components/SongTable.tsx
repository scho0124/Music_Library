import { useState } from "react";
import { Play, Pause, Star } from "lucide-react";

import { useLibraryStore, ColumnKey, ALL_COLUMNS } from "@/stores/libraryStore";
import { usePlaybackStore } from "@/stores/playbackStore";

const MIN_WIDTH = 120;
const RESIZABLE: ColumnKey[] = ["title", "artist", "album", "genre"];

export const SongTable = () => {
  const { songs, visibleColumns, toggleColumn, setRating } = useLibraryStore();

  const { currentTrack, isPlaying, setQueueAndPlay, togglePlay } =
    usePlaybackStore();

  // -----------------------------
  // SORT
  // -----------------------------
  const [sortKey, setSortKey] = useState<ColumnKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: ColumnKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedSongs = [...songs].sort((a, b) => {
    const aVal = (a as any)[sortKey];
    const bVal = (b as any)[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortDir === "asc"
      ? String(aVal ?? "").localeCompare(String(bVal ?? ""))
      : String(bVal ?? "").localeCompare(String(aVal ?? ""));
  });

  // -----------------------------
  // WIDTHS
  // -----------------------------
  const [widths, setWidths] = useState<Record<ColumnKey, number>>({
    title: 300,
    artist: 200,
    album: 200,
    genre: 150,
    duration: 100,
    rating: 120,
    listenCount: 100,
  });

  const startResize = (col: ColumnKey, e: React.MouseEvent) => {
    if (!RESIZABLE.includes(col)) return;

    const startX = e.clientX;
    const startWidth = widths[col];

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const next = Math.max(MIN_WIDTH, startWidth + delta);

      setWidths((prev) => ({
        ...prev,
        [col]: next,
      }));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const formatTime = (v: number) => {
    const m = Math.floor(v / 60);
    const s = Math.floor(v % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const gridTemplate = `
    40px
    ${visibleColumns.map((c) => `${widths[c]}px`).join(" ")}
  `;

  // -----------------------------
  return (
    <div className="relative flex h-full w-full flex-col border rounded-md overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: "max-content" }}>
          <div
            className="grid text-xs font-semibold bg-muted border-b sticky top-0 z-10"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="px-3 py-2 border-r bg-muted">#</div>

            {visibleColumns.map((col) => (
              <div
                key={col}
                className="relative px-3 py-2 border-r cursor-pointer bg-muted"
                onClick={() => handleSort(col)}
              >
                {col}
                {sortKey === col ? (sortDir === "asc" ? " ↑" : " ↓") : ""}

                {RESIZABLE.includes(col) && (
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startResize(col, e);
                    }}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                  />
                )}
              </div>
            ))}
          </div>

          {/* ROWS */}
          {sortedSongs.map((song, index) => {
            const isActive = currentTrack?.id === song.id;

            return (
              <div
                key={song.id}
                onDoubleClick={() => setQueueAndPlay(sortedSongs, index)}
                className={`grid text-sm cursor-pointer ${
                  isActive ? "bg-blue-500 text-white" : "hover:bg-muted"
                }`}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="flex justify-center px-3 py-2 border-r">
                  {isActive ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                    >
                      {isPlaying ? <Pause /> : <Play />}
                    </button>
                  ) : (
                    index + 1
                  )}
                </div>

                {visibleColumns.map((col) => (
                  <div
                    key={col}
                    className="px-3 py-2 border-r min-w-0 overflow-hidden"
                  >
                    {col === "rating" ? (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 cursor-pointer ${
                              (song.rating ?? 0) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRating(song.id, star);
                            }}
                          />
                        ))}
                      </div>
                    ) : col === "duration" ? (
                      formatTime(song.duration)
                    ) : (
                      <span className="truncate">
                        {(song as any)[col] ?? "-"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
