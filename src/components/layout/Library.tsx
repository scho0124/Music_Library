import { useMemo, useState } from "react";
import { SongTable } from "../SongTable";
import { ArtistsView } from "@/views/ArtistsView";
import { AlbumsView } from "@/views/AlbumsView";

import { usePlaylistStore } from "@/stores/playlistStore";
import { useLibraryStore } from "@/stores/libraryStore";

export const Library = () => {
  const { activePlaylistId, playlists, renamePlaylist } = usePlaylistStore();

  const {
    songs,
    view,
    setView,
    activeArtist,
    activeAlbum,
    setArtistFilter,
    setAlbumFilter,
  } = useLibraryStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);

  const albumYear = useMemo(() => {
    if (!activeAlbum) return null;

    const match = songs.find(
      (s) =>
        s.album === activeAlbum.name &&
        s.artist === activeAlbum.artist &&
        (s as any).year
    );

    return match ? (match as any).year : null;
  }, [songs, activeAlbum]);

  const filteredSongs = useMemo(() => {
    if (view !== "songs") return songs;

    if (activePlaylist) {
      return songs.filter((s) => activePlaylist.songIds.includes(s.id));
    }

    if (activeAlbum) {
      return songs.filter(
        (s) => s.album === activeAlbum.name && s.artist === activeAlbum.artist
      );
    }

    if (activeArtist) {
      return songs.filter((s) => s.artist === activeArtist);
    }

    return songs;
  }, [songs, activePlaylist, activeAlbum, activeArtist, view]);

  const goToSongs = () => {
    setView("songs");
    setArtistFilter(null);
    setAlbumFilter(null);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* TOP BAR */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
        {/* PLAYLIST */}
        {activePlaylist ? (
          <div className="flex items-center gap-2">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  renamePlaylist(activePlaylist.id, name);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renamePlaylist(activePlaylist.id, name);
                    setEditing(false);
                  }
                  if (e.key === "Escape") {
                    setEditing(false);
                  }
                }}
                autoFocus
                className="text-lg font-semibold bg-transparent outline-none"
              />
            ) : (
              <>
                <div className="text-lg font-semibold">
                  {activePlaylist.name}
                </div>
                <button
                  onClick={() => {
                    setEditing(true);
                    setName(activePlaylist.name);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  edit
                </button>
              </>
            )}
          </div>
        ) : activeAlbum && view === "songs" ? (
          <div className="text-lg font-semibold">
            {activeAlbum.name}
            {albumYear ? ` (${albumYear})` : ""}
          </div>
        ) : activeArtist && view === "songs" ? (
          <div className="text-lg font-semibold">{activeArtist}</div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={goToSongs}
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
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 w-full overflow-hidden">
        {view === "songs" && <SongTable overrideSongs={filteredSongs} />}

        {view === "albums" && <AlbumsView />}
        {view === "artists" && <ArtistsView />}
      </div>
    </div>
  );
};
