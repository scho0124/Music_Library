import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";

import { scanDirectory } from "@/services/libraryService";
import { useLibraryStore } from "@/stores/libraryStore";

export const MenuBar = () => {
  const [loading, setLoading] = useState(false);
  const { setSongs } = useLibraryStore();

  const handleImport = async () => {
    console.log("Import clicked");

    try {
      setLoading(true);

      const folder = await open({
        directory: true,
        multiple: false,
      });

      console.log("Selected folder:", folder);

      if (!folder) return;

      const rawSongs = await scanDirectory(folder as string);

      console.log("Raw songs:", rawSongs);

      const mapped = rawSongs.map((s: any, i: number) => ({
        id: i,
        title: s.title,
        artist: s.artist,
        album: s.album,
        duration: s.duration,
        path: s.path,
        src: convertFileSrc(s.path),
      }));

      console.log("Mapped songs:", mapped);

      setSongs(mapped);

      console.log("Library updated");
    } catch (err) {
      console.error("Import failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-50 flex h-10 items-center justify-between border-b bg-background px-3">
      {/* LEFT */}
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={handleImport}
          className="rounded px-2 py-1 text-blue-500 hover:bg-muted"
        >
          {loading ? "Importing..." : "Import Folder"}
        </button>
      </div>

      {/* RIGHT */}
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input className="h-8 w-56 pl-8" placeholder="Search library..." />
      </div>
    </div>
  );
};
