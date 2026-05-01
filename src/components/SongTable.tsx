import { useState, useMemo, useRef, useEffect } from "react";
import { Play, Pause, Star } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useLibraryStore, ColumnKey, ALL_COLUMNS } from "@/stores/libraryStore";
import { usePlaybackStore } from "@/stores/playbackStore";
import { usePlaylistStore } from "@/stores/playlistStore";
import { Song } from "@/types/Song";
import { invoke } from "@tauri-apps/api/core";

const MIN_WIDTH = 120;
const RESIZABLE: ColumnKey[] = ["title", "artist", "album", "genre"];

type Props = {
  overrideSongs?: Song[];
};

export const SongTable = ({ overrideSongs }: Props) => {
  const {
    songs: librarySongs,
    visibleColumns,
    toggleColumn,
    setRating,
    setSongs,
  } = useLibraryStore();

  const { currentTrack, isPlaying, setQueueAndPlay, togglePlay } =
    usePlaybackStore();

  const { playlists, addToPlaylist, isSongInPlaylist } = usePlaylistStore();

  const songs = overrideSongs ?? librarySongs;

  // -----------------------------
  // SELECTION
  // -----------------------------
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const lastSelectedRef = useRef<number | null>(null);

  const handleSelect = (e: React.MouseEvent, index: number, songId: number) => {
    const next = new Set(selectedIds);

    if (e.shiftKey && lastSelectedRef.current !== null) {
      const start = Math.min(lastSelectedRef.current, index);
      const end = Math.max(lastSelectedRef.current, index);

      for (let i = start; i <= end; i++) {
        next.add(sortedSongs[i].id);
      }
    } else if (e.metaKey || e.ctrlKey) {
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);

      lastSelectedRef.current = index;
    } else {
      next.clear();
      next.add(songId);
      lastSelectedRef.current = index;
    }

    setSelectedIds(next);
  };

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

  const sortedSongs = useMemo(() => {
    if (!songs.length) return [];

    const arr = [...songs];

    const isNumeric =
      sortKey === "duration" ||
      sortKey === "rating" ||
      sortKey === "listenCount";

    arr.sort((a, b) => {
      let aVal: any = (a as any)[sortKey];
      let bVal: any = (b as any)[sortKey];

      if (isNumeric) {
        aVal = aVal ?? 0;
        bVal = bVal ?? 0;
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortDir === "asc"
        ? String(aVal ?? "").localeCompare(String(bVal ?? ""))
        : String(bVal ?? "").localeCompare(String(aVal ?? ""));
    });

    return arr;
  }, [songs, sortKey, sortDir]);

  // -----------------------------
  // DELETE
  // -----------------------------
  const handleDelete = async (ids: number[]) => {
    if (!ids.length) return;

    await invoke("delete_songs", { ids });

    // remove from UI immediately
    setSongs(librarySongs.filter((s) => !ids.includes(s.id)));

    setSelectedIds(new Set());
    setRowMenu(null);
  };

  // delete key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        handleDelete(Array.from(selectedIds));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIds, librarySongs]);

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

  const gridTemplate = `
    40px
    ${visibleColumns.map((c) => `${widths[c]}px`).join(" ")}
  `;

  const formatTime = (v: number) => {
    const m = Math.floor(v / 60);
    const s = Math.floor(v % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // -----------------------------
  // VIRTUALIZATION
  // -----------------------------
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: sortedSongs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  // -----------------------------
  // MENUS
  // -----------------------------
  const [columnMenu, setColumnMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [rowMenu, setRowMenu] = useState<{
    x: number;
    y: number;
    song: Song;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleRowContext = (e: React.MouseEvent, song: Song) => {
    e.preventDefault();
    e.stopPropagation();
    setRowMenu({ x: e.clientX, y: e.clientY, song });
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setRowMenu(null);
        setColumnMenu(null);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  // -----------------------------
  return (
    <div className="relative flex h-full w-full flex-col border rounded-md overflow-hidden">
      {/* HEADER */}
      <div
        className="grid text-xs font-semibold bg-muted border-b sticky top-0 z-10"
        style={{ gridTemplateColumns: gridTemplate }}
        onContextMenu={(e) => {
          e.preventDefault();
          setColumnMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <div className="px-3 py-2 border-r">#</div>

        {visibleColumns.map((col) => (
          <div
            key={col}
            className="relative px-3 py-2 border-r cursor-pointer"
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

      {/* BODY */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const song = sortedSongs[virtualRow.index];
            const index = virtualRow.index;
            const isActive = currentTrack?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={(e) => handleSelect(e, index, song.id)}
                onDoubleClick={() => setQueueAndPlay(sortedSongs, index)}
                onContextMenu={(e) => handleRowContext(e, song)}
                className={`absolute top-0 left-0 w-full grid text-sm cursor-pointer ${
                  selectedIds.has(song.id)
                    ? "bg-blue-600 text-white"
                    : isActive
                    ? "bg-blue-500 text-white"
                    : "hover:bg-muted"
                }`}
                style={{
                  gridTemplateColumns: gridTemplate,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
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
                  <div key={col} className="px-3 py-2 border-r truncate">
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
                      (song as any)[col] ?? "-"
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN MENU */}
      {columnMenu && (
        <div
          className="fixed bg-background border shadow p-2 text-xs z-50"
          style={{ top: columnMenu.y, left: columnMenu.x }}
        >
          {ALL_COLUMNS.map((col) => (
            <div
              key={col}
              onClick={() => toggleColumn(col)}
              className="px-2 py-1 hover:bg-muted cursor-pointer"
            >
              {visibleColumns.includes(col) ? "✓ " : ""} {col}
            </div>
          ))}
        </div>
      )}

      {/* ROW MENU */}
      {rowMenu && (
        <div
          ref={menuRef}
          className="fixed bg-background border shadow p-2 text-sm z-50 w-56"
          style={{ top: rowMenu.y, left: rowMenu.x }}
        >
          <div className="text-xs text-muted-foreground px-2 py-1">
            Add to playlist
          </div>

          {playlists.map((p) => (
            <div
              key={p.id}
              onClick={() => addToPlaylist(p.id, [rowMenu.song.id])}
              className="px-2 py-1 hover:bg-muted cursor-pointer flex justify-between"
            >
              <span>{p.name}</span>
              {isSongInPlaylist(p.id, rowMenu.song.id) && "✓"}
            </div>
          ))}

          <div className="border-t my-2" />

          <div
            onClick={() => handleDelete([rowMenu.song.id])}
            className="px-2 py-1 hover:bg-muted text-red-500 cursor-pointer"
          >
            Delete
          </div>

          <div className="px-2 py-1 text-muted-foreground">
            Edit (coming soon)
          </div>
        </div>
      )}
    </div>
  );
};
