import { create } from "zustand";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { Song } from "@/types/Song";

export type ColumnKey =
  | "title"
  | "artist"
  | "album"
  | "genre"
  | "duration"
  | "rating"
  | "listenCount";

export const ALL_COLUMNS: ColumnKey[] = [
  "title",
  "artist",
  "album",
  "genre",
  "duration",
  "rating",
  "listenCount",
];

type LibraryView = "songs" | "albums" | "artists";

type Album = {
  name: string;
  artist: string;
  year?: number;
  artwork?: string;
};

type Artist = {
  name: string;
};

type LibraryState = {
  songs: Song[];
  albums: Album[];
  artists: Artist[];

  visibleColumns: ColumnKey[];
  view: LibraryView;

  activeArtist: string | null;
  activeAlbum: { name: string; artist: string } | null;

  artistImages: Record<string, string>;
  albumImages: Record<string, string>;

  setSongs: (songs: Song[]) => void;
  loadDerived: () => Promise<void>;
  refreshDerived: () => Promise<void>;

  toggleColumn: (col: ColumnKey) => void;
  setRating: (id: number, rating: number) => void;
  incrementListenCount: (id: number) => void;

  setView: (view: LibraryView) => void;

  setArtistFilter: (artist: string | null) => void;
  setAlbumFilter: (album: { name: string; artist: string } | null) => void;

  setArtistImage: (artist: string, url: string) => void;
  setAlbumImage: (key: string, url: string) => void;
};

// ✅ CORRECT helper (Tauri v2)
const toFileUrl = (path?: string | null) => {
  if (!path) return undefined;
  return convertFileSrc(path);
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  songs: [],
  albums: [],
  artists: [],

  visibleColumns: ALL_COLUMNS,
  view: "songs",

  activeArtist: null,
  activeAlbum: null,

  artistImages: JSON.parse(localStorage.getItem("artistImages") || "{}"),
  albumImages: JSON.parse(localStorage.getItem("albumImages") || "{}"),

  setSongs: (songs) => set({ songs }),

  loadDerived: async () => {
    try {
      const [albums, artists] = await Promise.all([
        invoke<Album[]>("get_albums"),
        invoke<Artist[]>("get_artists"),
      ]);

      const normalizedAlbums = albums.map((a) => ({
        ...a,
        artwork: toFileUrl(a.artwork),
      }));

      set({
        albums: normalizedAlbums,
        artists,
      });
    } catch (err) {
      console.error("Failed to load derived data:", err);
    }
  },

  refreshDerived: async () => {
    await get().loadDerived();
  },

  toggleColumn: (col) =>
    set((state) => ({
      visibleColumns: state.visibleColumns.includes(col)
        ? state.visibleColumns.filter((c) => c !== col)
        : [...state.visibleColumns, col],
    })),

  setRating: async (id, rating) => {
    await invoke("set_rating", { id, rating });

    set((state) => ({
      songs: state.songs.map((s) => (s.id === id ? { ...s, rating } : s)),
    }));
  },

  incrementListenCount: async (id) => {
    await invoke("increment_listen_count", { id });

    set((state) => ({
      songs: state.songs.map((s) =>
        s.id === id ? { ...s, listenCount: (s.listenCount ?? 0) + 1 } : s
      ),
    }));
  },

  setView: (view) => set({ view }),

  setArtistFilter: (artist) =>
    set({
      activeArtist: artist,
      activeAlbum: null,
      view: "songs",
    }),

  setAlbumFilter: (album) =>
    set({
      activeAlbum: album,
      activeArtist: null,
      view: "songs",
    }),

  setArtistImage: (artist, url) =>
    set((state) => {
      const updated = { ...state.artistImages, [artist]: url };
      localStorage.setItem("artistImages", JSON.stringify(updated));
      return { artistImages: updated };
    }),

  setAlbumImage: (key, url) =>
    set((state) => {
      const updated = { ...state.albumImages, [key]: url };
      localStorage.setItem("albumImages", JSON.stringify(updated));
      return { albumImages: updated };
    }),
}));
