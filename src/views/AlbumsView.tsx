import { useMemo, useState } from "react";
import { useLibraryStore } from "@/stores/libraryStore";

export const AlbumsView = () => {
  const { albums, setAlbumFilter, setView } = useLibraryStore();

  const [sort, setSort] = useState<"asc" | "desc" | "year">("asc");

  const sortedAlbums = useMemo(() => {
    const arr = [...albums];

    if (sort === "asc") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "desc") {
      arr.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      arr.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    }

    return arr;
  }, [albums, sort]);

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="text-sm font-semibold">Albums</div>

        <div className="flex gap-2">
          {[
            { key: "asc", label: "A → Z" },
            { key: "desc", label: "Z → A" },
            { key: "year", label: "Year" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setSort(btn.key as any)}
              className={`px-2 py-1 text-xs rounded border transition ${
                sort === btn.key
                  ? "bg-muted border-border font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-4">
          {sortedAlbums.map((album) => (
            <div
              key={`${album.name}-${album.artist}`}
              className="cursor-pointer"
              onClick={() => {
                setAlbumFilter({
                  name: album.name,
                  artist: album.artist,
                });
                setView("songs");
              }}
            >
              <div className="aspect-square bg-muted rounded" />

              <div className="mt-2 text-sm font-medium">
                {album.name} {album.year ? `(${album.year})` : ""}
              </div>

              <div className="text-xs text-muted-foreground">
                {album.artist}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
