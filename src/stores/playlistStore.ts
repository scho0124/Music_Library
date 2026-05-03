import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Playlist = {
  id: number;
  name: string;
  songIds: number[];
};

type PlaylistState = {
  playlists: Playlist[];
  activePlaylistId: number | null;

  createPlaylist: () => void;
  renamePlaylist: (id: number, name: string) => void;
  deletePlaylist: (id: number) => void;
  setActivePlaylist: (id: number | null) => void;

  addToPlaylist: (playlistId: number, songIds: number[]) => void;
  isSongInPlaylist: (playlistId: number, songId: number) => boolean;
};

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      activePlaylistId: null,

      createPlaylist: () => {
        const { playlists } = get();

        const id =
          playlists.length > 0
            ? Math.max(...playlists.map((p) => p.id)) + 1
            : 1;

        const newPlaylist: Playlist = {
          id,
          name: `Playlist #${id}`,
          songIds: [],
        };

        set({
          playlists: [...playlists, newPlaylist],
          activePlaylistId: id,
        });
      },

      renamePlaylist: (id, name) =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed) return state;

          return {
            playlists: state.playlists.map((p) =>
              p.id === id ? { ...p, name: trimmed } : p
            ),
          };
        }),

      setActivePlaylist: (id) => set({ activePlaylistId: id }),

      addToPlaylist: (playlistId, songIds) =>
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p;

            const merged = new Set([...p.songIds, ...songIds]);
            return { ...p, songIds: Array.from(merged) };
          }),
        })),

      deletePlaylist: (id) =>
        set((state) => {
          const filtered = state.playlists.filter((p) => p.id !== id);

          return {
            playlists: filtered,
            activePlaylistId:
              state.activePlaylistId === id ? null : state.activePlaylistId,
          };
        }),

      isSongInPlaylist: (playlistId, songId) => {
        const p = get().playlists.find((pl) => pl.id === playlistId);
        return p ? p.songIds.includes(songId) : false;
      },
    }),
    {
      name: "playlist-storage",
    }
  )
);
