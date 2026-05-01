import { invoke } from "@tauri-apps/api/core";

export type BackendSong = {
  id: number;
  path: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre?: string | null;
  rating?: number | null;
  listen_count: number;
};

export const scanDirectory = (path: string) =>
  invoke<BackendSong[]>("scan_directory", { path });

export const loadSongs = () => invoke<BackendSong[]>("load_songs");

export const incrementListenCount = (id: number) =>
  invoke("increment_listen_count", { id });

export const setRating = (id: number, rating: number) =>
  invoke("set_rating", { id, rating });

export const deleteSongs = (ids: number[]) => invoke("delete_songs", { ids });
