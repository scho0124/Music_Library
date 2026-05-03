import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";

import { scanDirectory } from "@/services/libraryService";
import { useLibraryStore } from "@/stores/libraryStore";

export const MenuBar = () => {
  const [loading, setLoading] = useState(false);
  const { setSongs, setSearchQuery, searchQuery } = useLibraryStore();

  const handleImport = async () => {
    try {
      setLoading(true);

      const folder = await open({
        directory: true,
        multiple: false,
      });

      if (!folder) return;

      const rawSongs = await scanDirectory(folder as string);

      const mapped = rawSongs.map((s) => ({
        id: s.id,
        title: s.title ?? "Unknown",
        artist: s.artist ?? "Unknown",
        album: s.album ?? "Unknown",
        duration: s.duration ?? 0,

        src: convertFileSrc(s.path),
        artwork: null,

        genre: s.genre ?? "",
        rating: s.rating ?? 0,
        listenCount: s.listen_count ?? 0,
      }));

      setSongs(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-50 flex h-10 items-center justify-between border-b bg-background px-3">
      <div className="flex items-center gap-3 text-sm">
        <button onClick={handleImport}>
          {loading ? "Importing..." : "Import Folder"}
        </button>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-56 pl-8"
          placeholder="Search..."
        />
      </div>
    </div>
  );
};
