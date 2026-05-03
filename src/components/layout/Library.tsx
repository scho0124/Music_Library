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
    albums,
    albumImages,
  } = useLibraryStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);

  // -----------------------------
  // ALBUM META
  // -----------------------------
  const albumMeta = useMemo(() => {
    if (!activeAlbum) return null;

    const albumEntry = albums.find(
      (a) => a.name === activeAlbum.name && a.artist === activeAlbum.artist
    );

    const song = songs.find(
      (s) => s.album === activeAlbum.name && s.artist === activeAlbum.artist
    );

    return {
      artwork:
        song?.artwork ||
        albumEntry?.artwork ||
        albumImages[`${activeAlbum.name}__${activeAlbum.artist}`],
      year: albumEntry?.year ?? (song as any)?.year ?? null,
      genre: song?.genre ?? null,
    };
  }, [activeAlbum, albums, songs, albumImages]);

  // -----------------------------
  // FILTER
  // -----------------------------
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
      {/* HEADER */}
      <div className="border-b">
        {activePlaylist ? (
          <div className="px-4 py-2 flex items-center gap-2">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  renamePlaylist(activePlaylist.id, name);
                  setEditing(false);
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
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="h-20 w-20 rounded overflow-hidden bg-muted shrink-0">
              {albumMeta?.artwork && (
                <img
                  src={albumMeta.artwork}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <div className="text-lg font-semibold">
                {activeAlbum.name}
                {albumMeta?.year ? ` (${albumMeta.year})` : ""}
              </div>

              <div className="text-sm text-muted-foreground">
                {activeAlbum.artist}
              </div>

              {albumMeta?.genre && (
                <div className="text-xs text-muted-foreground">
                  {albumMeta.genre}
                </div>
              )}
            </div>
          </div>
        ) : activeArtist && view === "songs" ? (
          <div className="px-4 py-4">
            <div className="text-lg font-semibold">{activeArtist}</div>
          </div>
        ) : (
          <div className="flex items-center px-4 py-2 gap-1">
            {" "}
            <button
              onClick={goToSongs}
              className={`px-4 py-2 rounded-md transition ${
                view === "songs"
                  ? "font-semibold bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              Songs
            </button>
            <button
              onClick={() => setView("albums")}
              className={`px-4 py-2 rounded-md transition ${
                view === "albums"
                  ? "font-semibold bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              Albums
            </button>
            <button
              onClick={() => setView("artists")}
              className={`px-4 py-2 rounded-md transition ${
                view === "artists"
                  ? "font-semibold bg-muted"
                  : "hover:bg-muted/50"
              }`}
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
