import { useMemo, useState } from "react";
import { useLibraryStore } from "@/stores/libraryStore";

export const ArtistsView = () => {
  const { artists, setArtistFilter, setView } = useLibraryStore();

  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const sortedArtists = useMemo(() => {
    const arr = [...artists];

    if (sort === "asc") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      arr.sort((a, b) => b.name.localeCompare(a.name));
    }

    return arr;
  }, [artists, sort]);

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="text-sm font-semibold">Artists</div>

        <div className="flex gap-2">
          {[
            { key: "asc", label: "A → Z" },
            { key: "desc", label: "Z → A" },
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
          {sortedArtists.map((artist) => (
            <div
              key={artist.name}
              className="cursor-pointer"
              onClick={() => {
                setArtistFilter(artist.name);
                setView("songs");
              }}
            >
              <div className="aspect-square bg-muted rounded" />
              <div className="mt-2 text-sm font-medium">{artist.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
