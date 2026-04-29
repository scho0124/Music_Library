/**
 * MenuBar = desktop-style app menu
 *
 * Later this can trigger:
 * - Import folder
 * - Settings
 * - Metadata editing
 */
export const MenuBar = () => {
  const menuItems = [
    "File",
    "Edit",
    "View",
    "Playback",
    "Library",
    "Tools",
    "Settings",
    "Help",
  ];

  return (
    <div className="flex items-center gap-4 px-3 text-sm">
      {menuItems.map((item) => (
        <button key={item} className="px-2 py-1 rounded hover:bg-muted">
          {item}
        </button>
      ))}
    </div>
  );
};
