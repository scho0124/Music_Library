import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

export const DropOverlay = () => {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let unlistenHover: any;
    let unlistenDrop: any;
    let unlistenCancel: any;

    const setup = async () => {
      unlistenHover = await listen("tauri://file-drop-hover", () => {
        console.log("👀 Hovering files");
        setDragging(true);
      });

      unlistenDrop = await listen("tauri://file-drop", () => {
        setDragging(false);
      });

      unlistenCancel = await listen("tauri://file-drop-cancelled", () => {
        console.log("❌ Drop cancelled");
        setDragging(false);
      });
    };

    setup();

    return () => {
      unlistenHover?.();
      unlistenDrop?.();
      unlistenCancel?.();
    };
  }, []);

  if (!dragging) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="rounded-lg border bg-background px-6 py-4 text-sm shadow-lg">
        Drop folder to import music
      </div>
    </div>
  );
};
