/**
 * Sidebar = navigation + playlists
 *
 * Controls which view is active
 */
export const SideBar = () => {
  return (
    <div className="p-4 text-sm">
      {/* Library section */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          Library
        </p>

        <nav className="space-y-1">
          <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
            Songs
          </button>
          <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
            Albums
          </button>
          <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
            Artists
          </button>
        </nav>
      </div>

      {/* Playlists */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          Playlists
        </p>

        <nav className="space-y-1">
          <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
            Favorites
          </button>
          <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
            Recently Played
          </button>
        </nav>
      </div>
    </div>
  );
};
