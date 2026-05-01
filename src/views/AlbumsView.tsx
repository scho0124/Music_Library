export const AlbumsView = () => {
  return (
    <div className="h-full w-full overflow-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Albums</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square rounded bg-muted" />
            <p className="text-sm font-medium">Album {i + 1}</p>
            <p className="text-xs text-muted-foreground">Artist</p>
          </div>
        ))}
      </div>
    </div>
  );
};
