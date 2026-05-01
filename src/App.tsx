import { AppShell } from "./components/layout/AppShell";
import { MenuBar } from "./components/layout/MenuBar";
import { SideBar } from "./components/layout/SideBar";
import { PlayerBar } from "./components/layout/PlayerBar";
import { Library } from "./components/layout/Library";

import { DropOverlay } from "./components/DropOverlay";

import { useEffect } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { useLibraryStore } from "@/stores/libraryStore";
import { Song } from "./types/Song";

export default function App() {
  const { setSongs, loadDerived } = useLibraryStore();

  useEffect(() => {
    const load = async () => {
      const data = await invoke<any[]>("load_songs");

      const songs: Song[] = data.map((s) => ({
        ...s,
        src: convertFileSrc(s.path),
        listenCount: s.listen_count ?? 0,
      }));

      setSongs(songs);
      await loadDerived();
    };

    load();
  }, []);

  return (
    <>
      <DropOverlay />

      <AppShell menu={<MenuBar />} sidebar={<SideBar />} player={<PlayerBar />}>
        <Library />
      </AppShell>
    </>
  );
}
