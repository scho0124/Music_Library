import { useState } from "react";
import { SongTable } from "../SongTable";

/**
 * Library
 *
 * Controls which view is displayed:
 * - Songs
 * - Albums
 * - Artists
 *
 * Later this should be controlled by Sidebar (global state)
 */
export const Library = () => {
  const [view, setView] = useState<"songs" | "albums" | "artists">("songs");

  return (
    <div className="flex h-full flex-col">
      {/* Top: View Switcher (temporary for dev) */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
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

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {view === "songs" && <SongTable />}
        {view === "albums" && <AlbumsView />}
        {view === "artists" && <ArtistsView />}
      </div>
    </div>
  );
};

// Will Extract Later

const SongsView = () => {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Songs</h2>

      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded px-3 py-2 hover:bg-muted"
          >
            <span>Song {i + 1}</span>
            <span className="text-sm text-muted-foreground">3:45</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AlbumsView = () => {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Albums</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square rounded bg-muted" />
            <p className="text-sm font-medium">Album {i + 1}</p>
            <p className="text-xs text-muted-foreground">Artist</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArtistsView = () => {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Artists</h2>

      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded px-3 py-2 hover:bg-muted">
            Artist {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
