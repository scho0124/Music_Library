import { create } from "zustand";

export type LibrarySong = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  path: string;
  src: string;
};

type LibraryState = {
  songs: LibrarySong[];
  setSongs: (songs: LibrarySong[]) => void;
};

export const useLibraryStore = create<LibraryState>((set) => ({
  songs: [],
  setSongs: (songs) => set({ songs }),
}));
