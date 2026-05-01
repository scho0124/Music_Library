import { useState, useEffect } from "react";
import { SongTable } from "../SongTable";

import { loadSongs } from "@/services/libraryService";
import { useLibraryStore } from "@/stores/libraryStore";
import { convertFileSrc } from "@tauri-apps/api/core";

export const Library = () => {
  const [view, setView] = useState<"songs" | "albums" | "artists">("songs");
  const { setSongs } = useLibraryStore();

  // -----------------------------
  // LOAD FROM SQLITE ON START
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadSongs();

        const mapped = data.map((s) => ({
          id: s.id,
          title: s.title ?? "Unknown",
          artist: s.artist ?? "Unknown",
          album: s.album ?? "Unknown",
          duration: s.duration ?? 0,

          src: convertFileSrc(s.path),
          artwork: null,

          genre: s.genre ?? "",
          rating: s.rating ?? 0,
          listenCount: s.listen_count ?? 0,
        }));

        setSongs(mapped);
      } catch (err) {
        console.error("Failed to load songs:", err);
      }
    };

    init();
  }, [setSongs]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* TOP BAR */}
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2">
        <button
          onClick={() => setView("songs")}
          className={view === "songs" ? "font-semibold" : ""}
        >
          Songs
        </button>

        <button
          onClick={() => setView("albums")}
          className={view === "albums" ? "font-semibold" : ""}
        >
          Albums
        </button>

        <button
          onClick={() => setView("artists")}
          className={view === "artists" ? "font-semibold" : ""}
        >
          Artists
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 w-full overflow-hidden">
        {view === "songs" && <SongTable />}
        {view === "albums" && <AlbumsView />}
        {view === "artists" && <ArtistsView />}
      </div>
    </div>
  );
};

// -----------------------------
// Albums (placeholder)
// -----------------------------
const AlbumsView = () => {
  return (
    <div className="h-full w-full overflow-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Albums</h2>
    </div>
  );
};

// -----------------------------
// Artists (placeholder)
// -----------------------------
const ArtistsView = () => {
  return (
    <div className="h-full w-full overflow-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Artists</h2>
    </div>
  );
};
