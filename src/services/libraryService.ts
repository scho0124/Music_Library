import { invoke } from "@tauri-apps/api/core";

export type RawSong = {
  path: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
};

export const scanDirectory = async (path: string): Promise<RawSong[]> => {
  return await invoke("scan_directory", { path });
};
