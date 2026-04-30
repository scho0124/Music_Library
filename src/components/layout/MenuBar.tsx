import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
    <div className="flex h-full items-center justify-between px-3">
      {/* Left: Menu items */}
      <div className="flex items-center gap-4 text-sm">
        {menuItems.map((item) => (
          <button key={item} className="px-2 py-1 rounded hover:bg-muted">
            {item}
          </button>
        ))}
      </div>

      {/* Right: Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />

        <Input
          type="search"
          placeholder="Search library..."
          className="h-8 w-56 pl-8"
        />
      </div>
    </div>
  );
};
