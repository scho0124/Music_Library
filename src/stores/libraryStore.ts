import { create } from "zustand";
import {
  incrementListenCount as incrementListenCountAPI,
  setRating as setRatingAPI,
} from "@/services/libraryService";

export type ColumnKey =
  | "title"
  | "artist"
  | "album"
  | "duration"
  | "genre"
  | "rating"
  | "listenCount";

export const ALL_COLUMNS: ColumnKey[] = [
  "title",
  "artist",
  "album",
  "duration",
  "genre",
  "rating",
  "listenCount",
];

export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  artwork?: string | null;

  genre?: string;
  rating?: number;
  listenCount: number;
};

type LibraryState = {
  songs: Song[];
  visibleColumns: ColumnKey[];

  setSongs: (songs: Song[]) => void;

  incrementListenCount: (id: number) => void;
  setRating: (id: number, rating: number) => void;

  toggleColumn: (column: ColumnKey) => void;
};

// -----------------------------
// LOAD PERSISTED COLUMNS
// -----------------------------
const loadColumns = (): ColumnKey[] => {
  const stored = localStorage.getItem("columns");
  if (!stored) return ["title", "artist", "album", "duration"];
  return JSON.parse(stored);
};

export const useLibraryStore = create<LibraryState>((set) => ({
  songs: [],
  visibleColumns: loadColumns(),

  setSongs: (songs) => set({ songs }),

  // -----------------------------
  // LISTEN COUNT (DB + UI)
  // -----------------------------
  incrementListenCount: (id) => {
    incrementListenCountAPI(id);

    set((state) => ({
      songs: state.songs.map((s) =>
        s.id === id ? { ...s, listenCount: s.listenCount + 1 } : s
      ),
    }));
  },

  // -----------------------------
  // RATING (DB + UI)
  // -----------------------------
  setRating: (id, rating) => {
    setRatingAPI(id, rating);

    set((state) => ({
      songs: state.songs.map((s) => (s.id === id ? { ...s, rating } : s)),
    }));
  },

  // -----------------------------
  // COLUMN TOGGLE + PERSIST
  // -----------------------------
  toggleColumn: (column) =>
    set((state) => {
      const updated = state.visibleColumns.includes(column)
        ? state.visibleColumns.filter((c) => c !== column)
        : [...state.visibleColumns, column];

      localStorage.setItem("columns", JSON.stringify(updated));

      return { visibleColumns: updated };
    }),
}));
