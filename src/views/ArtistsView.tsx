export const ArtistsView = () => {
  return (
    <div className="h-full w-full overflow-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Artists</h2>

      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded px-3 py-2 hover:bg-muted">
            Artist {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
