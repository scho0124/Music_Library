import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { convertFileSrc } from "@tauri-apps/api/core";

import { scanDirectory } from "@/services/libraryService";
import { useLibraryStore } from "@/stores/libraryStore";

export const useFileDrop = () => {
  const { setSongs } = useLibraryStore();

  useEffect(() => {
    console.log("✅ useFileDrop mounted");

    let unlistenDrop: (() => void) | null = null;

    const setup = async () => {
      try {
        unlistenDrop = await listen<string[]>(
          "tauri://file-drop",
          async (event) => {
            const paths = event.payload;

            if (!paths || paths.length === 0) {
              console.log("⚠️ No paths in drop");
              return;
            }

            const folder = paths[0];

            console.log("📂 Dropped:", folder);

            try {
              const rawSongs = await scanDirectory(folder);

              const mapped = rawSongs.map((s: any, i: number) => ({
                id: i,
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: s.duration,
                path: s.path,
                src: convertFileSrc(s.path),
                artwork: s.artwork,
              }));

              setSongs(mapped);

              console.log("✅ Library loaded from drop");
            } catch (err) {
              console.error("❌ Scan failed:", err);
            }
          }
        );
      } catch (err) {
        console.error("❌ Failed to register drop listener:", err);
      }
    };

    setup();

    return () => {
      if (unlistenDrop) {
        unlistenDrop();
      }
    };
  }, [setSongs]);
};
