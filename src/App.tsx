import { AppShell } from "./components/layout/AppShell";
import { MenuBar } from "./components/layout/MenuBar";
import { SideBar } from "./components/layout/SideBar";
import { PlayerBar } from "./components/layout/PlayerBar";
import { Library } from "./components/layout/Library";

import { useFileDrop } from "./hooks/useFileDrop";
import { DropOverlay } from "./components/DropOverlay";

export default function App() {
  useFileDrop();

  return (
    <>
      <DropOverlay />

      <AppShell menu={<MenuBar />} sidebar={<SideBar />} player={<PlayerBar />}>
        <Library />
      </AppShell>
    </>
  );
}
