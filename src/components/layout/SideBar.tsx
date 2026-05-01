import { useState } from "react";
import { Plus } from "lucide-react";

import { usePlaylistStore } from "@/stores/playlistStore";
import { useLibraryStore } from "@/stores/libraryStore";

export const SideBar = () => {
  const {
    playlists,
    activePlaylistId,
    createPlaylist,
    renamePlaylist,
    setActivePlaylist,
  } = usePlaylistStore();

  const { setView, setArtistFilter, setAlbumFilter } = useLibraryStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");

  return (
    <div className="p-4 text-sm">
      {/* LIBRARY NAV */}
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        Library
      </p>

      <nav className="space-y-1">
        <button
          onClick={() => {
            setActivePlaylist(null);
            setArtistFilter(null);
            setAlbumFilter(null);
            setView("songs");
          }}
          className="w-full rounded px-2 py-1 text-left hover:bg-muted"
        >
          Songs
        </button>

        <button
          onClick={() => {
            setActivePlaylist(null);
            setArtistFilter(null);
            setAlbumFilter(null);
            setView("albums");
          }}
          className="w-full rounded px-2 py-1 text-left hover:bg-muted"
        >
          Albums
        </button>

        <button
          onClick={() => {
            setActivePlaylist(null);
            setArtistFilter(null);
            setAlbumFilter(null);
            setView("artists");
          }}
          className="w-full rounded px-2 py-1 text-left hover:bg-muted"
        >
          Artists
        </button>
      </nav>

      {/* PLAYLIST HEADER */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Playlists</p>

        <button onClick={() => setMenuOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* CREATE MENU */}
      {menuOpen && (
        <div className="mt-2 rounded border bg-background p-2 shadow">
          <div
            className="cursor-pointer px-2 py-1 hover:bg-muted"
            onClick={() => {
              createPlaylist();
              setMenuOpen(false);
            }}
          >
            Create Playlist
          </div>
        </div>
      )}

      {/* PLAYLIST LIST */}
      <nav className="mt-3 space-y-1">
        {playlists.map((p) => (
          <div
            key={p.id}
            className={`cursor-pointer rounded px-2 py-1 ${
              activePlaylistId === p.id ? "bg-muted" : "hover:bg-muted"
            }`}
            onClick={() => setActivePlaylist(p.id)}
          >
            {editing === p.id ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  renamePlaylist(p.id, name);
                  setEditing(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renamePlaylist(p.id, name);
                    setEditing(null);
                  }
                  if (e.key === "Escape") {
                    setEditing(null);
                  }
                }}
                autoFocus
                className="w-full bg-transparent outline-none"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span>{p.name}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(p.id);
                    setName(p.name);
                  }}
                  className="text-xs text-muted-foreground"
                >
                  edit
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};
